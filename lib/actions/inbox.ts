"use server";

import { auth } from "@/auth";
import { searchApartmentEmails, getGmailThread, getCombinedThreadBody, type GmailMessage } from "@/lib/gmail/client";
import { parseApartmentFromEmail, extractActionItemsFromEmail, generateEmailThreadSummary } from "@/lib/ai/apartment-parser";
import { createApartment } from "./apartments";

export interface ParsedEmail extends GmailMessage {
  relevanceScore?: number; // 0-100, higher = more likely to be apartment listing
  parsedData?: {
    address: string | null;
    unit: string | null;
    neighborhood: string | null;
    borough: string | null;
    price: number | null;
    beds: number | null;
    baths: number | null;
    sqft: number | null;
    floor: number | null;
    brokerName: string | null;
    brokerEmail: string | null;
    brokerPhone: string | null;
    amenities: string[];
    listingUrl: string | null;
    confidence: "high" | "medium" | "low";
    extractedText: string;
  };
}

/**
 * Calculate relevance score for an email (0-100)
 * Higher score = more likely to be an apartment listing
 */
function calculateRelevanceScore(email: GmailMessage): number {
  let score = 0;
  const subject = email.subject.toLowerCase();
  const snippet = email.snippet.toLowerCase();
  const body = email.body.toLowerCase();
  const combinedText = `${subject} ${snippet} ${body}`;

  // High value indicators (30 points each)
  if (email.hasStreetEasyLink || email.streetEasyUrls.length > 0) score += 30;
  if (/\$[0-9,]+\s*(\/mo|per month|month)/i.test(combinedText)) score += 30;

  // Medium value indicators (15 points each)
  if (/\d+\s*(bed|br|bedroom)/i.test(combinedText)) score += 15;
  if (/\d+\s*(bath|ba|bathroom)/i.test(combinedText)) score += 15;
  if (/(apartment|apt|listing|rental|unit|place)\s+(available|for rent|open)/i.test(combinedText)) score += 15;

  // Address patterns (20 points)
  if (/\d+\s+[nesw]\.?\s+\d+\s*(st|street|ave|avenue|rd|road)/i.test(combinedText)) score += 20;
  if (/(manhattan|brooklyn|queens|bronx|staten island)/i.test(combinedText)) score += 10;

  // Broker/agent indicators (10 points)
  if (/(broker|agent|showing|tour|viewing|schedule)/i.test(combinedText)) score += 10;

  // Square footage mention (10 points)
  if (/\d+\s*(sq\.?\s*ft|sqft|square feet)/i.test(combinedText)) score += 10;

  // NYC neighborhoods (5 points)
  if (/(chelsea|soho|tribeca|village|williamsburg|bushwick|astoria|dumbo)/i.test(combinedText)) score += 5;

  // Negative indicators (reduce score)
  if (/(unsubscribe|newsletter|promotional|marketing)/i.test(combinedText)) score -= 20;
  if (/(invoice|payment|receipt|confirmation|alert)/i.test(combinedText)) score -= 10;

  // Cap at 100
  return Math.min(100, Math.max(0, score));
}

export async function fetchApartmentEmails(): Promise<ParsedEmail[]> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const emails = await searchApartmentEmails(session.user.id, {
      maxResults: 50, // Get more emails to filter
    });

    // Calculate relevance score for each email
    const emailsWithScores = emails.map((email) => ({
      ...email,
      relevanceScore: calculateRelevanceScore(email),
    }));

    // Sort by relevance score (highest first)
    emailsWithScores.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    return emailsWithScores;
  } catch (error) {
    console.error("Error fetching apartment emails:", error);
    throw new Error(
      `Failed to fetch emails: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export async function parseEmailWithAI(
  emailId: string
): Promise<ParsedEmail["parsedData"]> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const emails = await searchApartmentEmails(session.user.id, {
      maxResults: 100,
    });

    const email = emails.find((e) => e.id === emailId);
    if (!email) {
      throw new Error("Email not found");
    }

    const parsed = await parseApartmentFromEmail(
      email.body,
      email.subject,
      email.streetEasyUrls
    );

    return parsed;
  } catch (error) {
    console.error("Error parsing email with AI:", error);
    throw new Error(
      `Failed to parse email: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export async function createApartmentFromParsedData(
  parsedData: ParsedEmail["parsedData"],
  emailId: string,
  emailBody?: string,
  emailSubject?: string,
  threadId?: string
): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!parsedData?.address) {
    throw new Error("Address is required to create an apartment");
  }

  // Check for duplicate address
  const { prisma } = await import("@/lib/prisma");
  const existing = await prisma.apartment.findFirst({
    where: {
      address: {
        equals: parsedData.address,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      address: true,
      unit: true,
    },
  });

  if (existing) {
    throw new Error(
      `An apartment at "${existing.address}${existing.unit ? ` Unit ${existing.unit}` : ""}" already exists. View it instead of creating a duplicate.`
    );
  }

  // Generate AI summary if email body is provided
  let summary: string | undefined;
  if (emailBody && emailSubject) {
    try {
      summary = await generateEmailThreadSummary(emailBody, emailSubject);
    } catch (error) {
      console.error("Error generating summary:", error);
      // Continue without summary
    }
  }

  // Get email date to store as lastEmailAt
  let lastEmailAt: Date | undefined;
  if (threadId) {
    try {
      const thread = await getGmailThread(session.user.id, threadId);
      if (thread) {
        lastEmailAt = thread.lastMessageDate;
      }
    } catch (error) {
      console.error("Error fetching thread for lastEmailAt:", error);
      // Continue without lastEmailAt
    }
  }

  const apartmentId = await createApartment({
    address: parsedData.address,
    unit: parsedData.unit || undefined,
    neighborhood: parsedData.neighborhood || undefined,
    borough: parsedData.borough || undefined,
    price: parsedData.price || undefined,
    beds: parsedData.beds || undefined,
    baths: parsedData.baths || undefined,
    sqft: parsedData.sqft || undefined,
    floor: parsedData.floor || undefined,
    listingUrl: parsedData.listingUrl || undefined,
    source: parsedData.listingUrl?.includes("streeteasy")
      ? "streeteasy"
      : "broker_email",
    status: "interested",
    brokerName: parsedData.brokerName || undefined,
    brokerEmail: parsedData.brokerEmail || undefined,
    brokerPhone: parsedData.brokerPhone || undefined,
    pointPersonId: session.user.id,
    amenities: parsedData.amenities.length > 0 ? parsedData.amenities : undefined,
    notes: `Imported from email. AI confidence: ${parsedData.confidence}.\n\n${parsedData.extractedText}`,
    descriptionSummary: summary,
    emailThreadId: threadId,
    lastEmailAt,
  });

  // Extract action items if email body is provided
  if (emailBody && emailSubject) {
    try {
      const extraction = await extractActionItemsFromEmail(emailBody, emailSubject);

      // Create action items
      for (const actionItem of extraction.actionItems) {
        await prisma.actionItem.create({
          data: {
            apartmentId,
            type: actionItem.type,
            description: actionItem.description,
            dueDate: actionItem.dueDate ? new Date(actionItem.dueDate) : null,
            link: actionItem.link,
          },
        });
      }

      // Create timeline events
      for (const timelineEvent of extraction.timelineEvents) {
        await prisma.timeline.create({
          data: {
            apartmentId,
            event: timelineEvent.event,
            description: timelineEvent.description,
            occurredAt: timelineEvent.occurredAt ? new Date(timelineEvent.occurredAt) : new Date(),
          },
        });
      }

      // Create documents
      for (const doc of extraction.documents) {
        await prisma.document.create({
          data: {
            apartmentId,
            name: doc.name,
            required: doc.required,
          },
        });
      }
    } catch (error) {
      console.error("Error extracting action items:", error);
      // Continue even if action item extraction fails
    }
  }

  return apartmentId;
}

/**
 * Check for new messages in existing apartment email threads and update apartments accordingly
 * Returns the number of apartments updated
 */
export async function detectAndUpdateEmailThreads(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { prisma } = await import("@/lib/prisma");

  try {
    // Get all apartments that have an email thread ID
    const apartments = await prisma.apartment.findMany({
      where: {
        emailThreadId: {
          not: null,
        },
      },
      select: {
        id: true,
        emailThreadId: true,
        lastEmailAt: true,
        address: true,
      },
    });

    let updatedCount = 0;

    for (const apartment of apartments) {
      if (!apartment.emailThreadId) continue;

      try {
        // Fetch the full thread from Gmail
        const thread = await getGmailThread(session.user.id, apartment.emailThreadId);

        if (!thread) {
          console.log(`Thread ${apartment.emailThreadId} not found for apartment ${apartment.id}`);
          continue;
        }

        // Check if there are new messages since lastEmailAt
        const lastEmailDate = apartment.lastEmailAt || new Date(0);
        const hasNewMessages = thread.lastMessageDate > lastEmailDate;

        if (!hasNewMessages) {
          console.log(`No new messages for apartment ${apartment.address}`);
          continue;
        }

        console.log(`Found new messages for apartment ${apartment.address}`);

        // Get the combined body of all messages
        const combinedBody = getCombinedThreadBody(thread);

        // Generate updated summary using Haiku (cheap model)
        const newSummary = await generateEmailThreadSummary(combinedBody, thread.subject);

        // Extract action items from the newest messages
        const newMessages = thread.messages.filter(msg => msg.date > lastEmailDate);
        const newMessagesBodies = newMessages.map(msg =>
          `From: ${msg.from}\nDate: ${msg.date.toISOString()}\n\n${msg.body}`
        ).join("\n\n---\n\n");

        const extraction = await extractActionItemsFromEmail(newMessagesBodies, thread.subject);

        // Update the apartment
        await prisma.apartment.update({
          where: { id: apartment.id },
          data: {
            descriptionSummary: newSummary,
            lastEmailAt: thread.lastMessageDate,
          },
        });

        // Create new action items
        for (const actionItem of extraction.actionItems) {
          await prisma.actionItem.create({
            data: {
              apartmentId: apartment.id,
              type: actionItem.type,
              description: actionItem.description,
              dueDate: actionItem.dueDate ? new Date(actionItem.dueDate) : null,
              link: actionItem.link,
            },
          });
        }

        // Create new timeline events
        for (const timelineEvent of extraction.timelineEvents) {
          await prisma.timeline.create({
            data: {
              apartmentId: apartment.id,
              event: timelineEvent.event,
              description: timelineEvent.description,
              occurredAt: timelineEvent.occurredAt ? new Date(timelineEvent.occurredAt) : new Date(),
            },
          });
        }

        // Create new documents if mentioned
        for (const doc of extraction.documents) {
          // Check if document already exists
          const existing = await prisma.document.findFirst({
            where: {
              apartmentId: apartment.id,
              name: {
                equals: doc.name,
                mode: "insensitive",
              },
            },
          });

          if (!existing) {
            await prisma.document.create({
              data: {
                apartmentId: apartment.id,
                name: doc.name,
                required: doc.required,
              },
            });
          }
        }

        updatedCount++;
      } catch (error) {
        console.error(`Error updating thread for apartment ${apartment.id}:`, error);
        // Continue with other apartments even if one fails
      }
    }

    return updatedCount;
  } catch (error) {
    console.error("Error detecting email thread updates:", error);
    throw new Error(
      `Failed to detect thread updates: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
