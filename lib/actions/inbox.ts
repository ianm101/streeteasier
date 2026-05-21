"use server";

import { auth } from "@/auth";
import { searchApartmentEmails, type GmailMessage } from "@/lib/gmail/client";
import { parseApartmentFromEmail } from "@/lib/ai/apartment-parser";
import { createApartment } from "./apartments";

export interface ParsedEmail extends GmailMessage {
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

export async function fetchApartmentEmails(): Promise<ParsedEmail[]> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const emails = await searchApartmentEmails(session.user.id, {
      maxResults: 20,
    });

    return emails;
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
