import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ParsedApartment {
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
}

export interface ActionItemExtraction {
  type: string; // "application_pending", "schedule_tour", "submit_documents", "sign_lease", "follow_up"
  description: string;
  dueDate: string | null; // ISO date string
  link: string | null;
}

export interface TimelineEventExtraction {
  event: string; // "inquiry_sent", "tour_scheduled", "tour_completed", "application_submitted", "application_approved", "lease_signed"
  description: string;
  occurredAt: string | null; // ISO date string
}

export interface DocumentExtraction {
  name: string;
  required: boolean;
}

export interface EmailActionItemsExtraction {
  actionItems: ActionItemExtraction[];
  timelineEvents: TimelineEventExtraction[];
  documents: DocumentExtraction[];
}

export interface BrokerThreadInfo {
  brokerName: string;
  brokerEmail: string;
  brokerPhone: string | null;
  brokerCompany: string | null;
  summary: string;
  status: "active" | "cold" | "completed";
  mentionedAddresses: string[];
  mentionedPrices: (number | null)[];
  userAsks: string[];
  brokerAsks: string[];
}

export async function parseApartmentFromEmail(
  emailBody: string,
  subject: string,
  streetEasyUrls: string[] = []
): Promise<ParsedApartment> {
  const prompt = `You are an expert at extracting apartment listing information from emails.

Extract the following information from this email about an NYC apartment listing:

Email Subject: ${subject}

Email Body:
${emailBody}

${streetEasyUrls.length > 0 ? `StreetEasy URLs found: ${streetEasyUrls.join(", ")}` : ""}

Please extract and return ONLY a JSON object with the following fields:
- address: Full street address (e.g., "123 W 14th Street")
- unit: Unit/apartment number if mentioned
- neighborhood: NYC neighborhood name
- borough: One of: Manhattan, Brooklyn, Queens, Bronx, Staten Island
- price: Monthly rent as a number (no $ or commas)
- beds: Number of bedrooms (can be decimal like 1.5 for studios)
- baths: Number of bathrooms (can be decimal)
- sqft: Square footage as a number
- floor: Floor number
- brokerName: Broker or agent name
- brokerEmail: Broker email address
- brokerPhone: Broker phone number
- amenities: Array of amenity keys from this list: ["in_unit_laundry", "laundry_in_building", "dishwasher", "doorman", "elevator", "outdoor_space", "building_amenities", "pets_allowed", "no_broker_fee", "furnished", "central_ac", "utilities_included", "parking"]
- listingUrl: The StreetEasy or other listing URL if present
- confidence: "high", "medium", or "low" based on how complete the information is
- extractedText: A brief summary of what apartment details were found

For any field you cannot find, use null. Return ONLY the JSON object, no other text.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from response (in case Claude adds explanation)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Add StreetEasy URL if not found by AI
    if (!parsed.listingUrl && streetEasyUrls.length > 0) {
      parsed.listingUrl = streetEasyUrls[0];
    }

    return parsed as ParsedApartment;
  } catch (error) {
    console.error("Error parsing apartment with AI:", error);
    // Return a low-confidence result with whatever we can extract
    return {
      address: null,
      unit: null,
      neighborhood: null,
      borough: null,
      price: null,
      beds: null,
      baths: null,
      sqft: null,
      floor: null,
      brokerName: null,
      brokerEmail: null,
      brokerPhone: null,
      amenities: [],
      listingUrl: streetEasyUrls[0] || null,
      confidence: "low",
      extractedText: "Error parsing email. Please review manually.",
    };
  }
}

export async function parseStreetEasyUrl(url: string): Promise<ParsedApartment> {
  // For now, return a placeholder - in a real implementation,
  // you might scrape the StreetEasy page or use their API
  return {
    address: null,
    unit: null,
    neighborhood: null,
    borough: null,
    price: null,
    beds: null,
    baths: null,
    sqft: null,
    floor: null,
    brokerName: null,
    brokerEmail: null,
    brokerPhone: null,
    amenities: [],
    listingUrl: url,
    confidence: "low",
    extractedText: `StreetEasy listing: ${url}. Details need to be extracted manually or via web scraping.`,
  };
}

/**
 * Generate a concise summary of an email thread using Claude Haiku (cheap model)
 * This is used to populate the descriptionSummary field on apartment cards
 */
export async function generateEmailThreadSummary(
  emailBody: string,
  subject: string
): Promise<string> {
  const prompt = `You are summarizing an email thread about an NYC apartment listing. Create a concise 2-3 sentence summary that captures the most important information for someone deciding whether to pursue this apartment.

Email Subject: ${subject}

Email Body:
${emailBody}

Focus on:
- Current status of the apartment/application process
- Key features or selling points mentioned
- Any important deadlines or next steps
- Notable concerns or issues

Keep it under 100 words. Be direct and informative. Return ONLY the summary text, no other formatting.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4",  // Using cheaper Haiku model instead of Sonnet
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    return responseText.trim();
  } catch (error) {
    console.error("Error generating summary with AI:", error);
    // Return a fallback summary from the subject line
    return `Email thread: ${subject}`;
  }
}

export async function extractActionItemsFromEmail(
  emailBody: string,
  subject: string
): Promise<EmailActionItemsExtraction> {
  const prompt = `You are an expert at extracting action items, timeline events, and document requirements from apartment hunting emails.

Analyze this email thread about an NYC apartment and extract:

Email Subject: ${subject}

Email Body:
${emailBody}

Please extract and return ONLY a JSON object with the following structure:

{
  "actionItems": [
    {
      "type": "application_pending" | "schedule_tour" | "submit_documents" | "sign_lease" | "follow_up",
      "description": "Brief description of what needs to be done",
      "dueDate": "ISO date string if mentioned, or null",
      "link": "URL if there's an application link, document link, or scheduling link"
    }
  ],
  "timelineEvents": [
    {
      "event": "inquiry_sent" | "tour_scheduled" | "tour_completed" | "application_submitted" | "application_approved" | "lease_signed",
      "description": "What happened",
      "occurredAt": "ISO date string when it happened, or null for current time"
    }
  ],
  "documents": [
    {
      "name": "Document name (e.g., 'Photo ID', 'Pay Stubs', 'Bank Statements')",
      "required": true | false
    }
  ]
}

Guidelines:
- For actionItems, identify what the person needs to DO next (fill out application, schedule tour, submit docs, etc.)
- For timelineEvents, identify what has ALREADY HAPPENED (tour completed, application submitted, etc.)
- Look for phrases like "I have filled out", "I completed", "we scheduled" to identify completed events
- For documents, extract any list of required documents mentioned
- Extract application links like realogy.weimark.com or other application portals
- If someone says they "can't upload documents" or similar, create an action item to follow up
- Use ISO 8601 format for dates (YYYY-MM-DDTHH:mm:ss.sssZ)

Return ONLY the JSON object, no other text.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed as EmailActionItemsExtraction;
  } catch (error) {
    console.error("Error extracting action items with AI:", error);
    return {
      actionItems: [],
      timelineEvents: [],
      documents: [],
    };
  }
}

/**
 * Extract broker thread information from an email thread using Claude Haiku
 * This identifies broker conversations that may mention multiple properties
 */
export async function extractBrokerThreadInfo(
  emailBody: string,
  subject: string,
  fromEmail: string
): Promise<BrokerThreadInfo> {
  const prompt = `You are analyzing an email thread about NYC apartment hunting with a real estate broker.

Email Subject: ${subject}
From: ${fromEmail}

Email Body/Thread:
${emailBody}

Extract the following information and return ONLY a JSON object:

{
  "brokerName": "Full name of the broker (e.g., 'Jermaine Johns')",
  "brokerEmail": "Broker's email address",
  "brokerPhone": "Broker's phone number if mentioned, otherwise null",
  "brokerCompany": "Brokerage company (e.g., 'Corcoran', 'Compass', 'CitiHabitats') or null",
  "summary": "2-3 sentence summary of the conversation and current status",
  "status": "active" | "cold" | "completed",
  "mentionedAddresses": ["Array of all apartment addresses mentioned in any message"],
  "mentionedPrices": [Array of prices corresponding to addresses, use null if price not mentioned for that address],
  "userAsks": ["Array of things the user/tenant is asking for or needs to do (e.g., 'Schedule showing', 'Submit application')"],
  "brokerAsks": ["Array of things the broker is asking the user to do (e.g., 'Fill out application', 'Send paystubs')"]
}

Guidelines:
- Extract broker info from email signature, headers, or message content
- Status: "active" if recent conversation, "cold" if > 1 week old, "completed" if lease signed or deal fell through
- Mentioned addresses: extract ALL properties discussed (e.g., "225 Eighth Avenue #2D", "225 Eighth Avenue #4D")
- Prices: match to addresses in same order, use null if not mentioned
- User asks: what the tenant/user needs/wants (showing requests, questions, document submission needs)
- Broker asks: what the broker is requesting from the user (fill forms, provide documents, schedule tour)

Return ONLY the JSON object, no other text.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4",  // Cheap model for broker thread analysis
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed as BrokerThreadInfo;
  } catch (error) {
    console.error("Error extracting broker thread info with AI:", error);
    // Return a fallback with minimal info
    return {
      brokerName: "Unknown Broker",
      brokerEmail: fromEmail,
      brokerPhone: null,
      brokerCompany: null,
      summary: `Email thread: ${subject}`,
      status: "active",
      mentionedAddresses: [],
      mentionedPrices: [],
      userAsks: [],
      brokerAsks: [],
    };
  }
}
