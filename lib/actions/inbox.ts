"use server";

import { auth } from "@/auth";
import { searchApartmentEmails, type GmailMessage } from "@/lib/gmail/client";
import { parseApartmentFromEmail } from "@/lib/ai/apartment-parser";
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
  emailId: string
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
  });

  return apartmentId;
}
