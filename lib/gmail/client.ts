import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export async function getGmailClient(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      googleRefreshToken: true,
      email: true,
    },
  });

  if (!user?.googleRefreshToken) {
    throw new Error("No Google refresh token found for user");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + "/api/auth/callback/google"
  );

  oauth2Client.setCredentials({
    refresh_token: user.googleRefreshToken,
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}

export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: Date;
  snippet: string;
  body: string;
  hasStreetEasyLink: boolean;
  streetEasyUrls: string[];
}

export interface GmailThread {
  id: string;
  messages: GmailMessage[];
  subject: string;
  snippet: string;
  hasStreetEasyLink: boolean;
  lastMessageDate: Date;
  messageCount: number;
}

export async function searchApartmentEmails(
  userId: string,
  options: {
    maxResults?: number;
    query?: string;
  } = {}
): Promise<GmailMessage[]> {
  const gmail = await getGmailClient(userId);

  // Search for emails with keywords like "apartment", "listing", "streeteasy", "beds", etc.
  const defaultQuery =
    'subject:(apartment OR listing OR rental OR "place to live" OR beds OR bedroom OR lease OR "for rent") OR from:streeteasy.com OR body:streeteasy.com OR body:"square feet" OR body:sqft';
  const query = options.query || defaultQuery;

  const response = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: options.maxResults || 50,
  });

  if (!response.data.messages) {
    return [];
  }

  const messages: GmailMessage[] = [];

  for (const message of response.data.messages) {
    try {
      const fullMessage = await gmail.users.messages.get({
        userId: "me",
        id: message.id!,
        format: "full",
      });

      const headers = fullMessage.data.payload?.headers || [];
      const subject =
        headers.find((h) => h.name === "Subject")?.value || "(No Subject)";
      const from = headers.find((h) => h.name === "From")?.value || "";
      const to = headers.find((h) => h.name === "To")?.value || "";
      const dateStr = headers.find((h) => h.name === "Date")?.value || "";
      const date = dateStr ? new Date(dateStr) : new Date();

      // Extract email body
      let body = "";
      if (fullMessage.data.payload?.parts) {
        // Multipart message
        const textPart = fullMessage.data.payload.parts.find(
          (part) => part.mimeType === "text/plain"
        );
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
        }
      } else if (fullMessage.data.payload?.body?.data) {
        // Simple message
        body = Buffer.from(
          fullMessage.data.payload.body.data,
          "base64"
        ).toString("utf-8");
      }

      // Check for StreetEasy URLs
      const streetEasyRegex =
        /https?:\/\/(www\.)?streeteasy\.com\/[^\s<>]*/gi;
      const streetEasyUrls = body.match(streetEasyRegex) || [];
      const hasStreetEasyLink = streetEasyUrls.length > 0;

      messages.push({
        id: fullMessage.data.id!,
        threadId: fullMessage.data.threadId!,
        subject,
        from,
        to,
        date,
        snippet: fullMessage.data.snippet || "",
        body,
        hasStreetEasyLink,
        streetEasyUrls,
      });
    } catch (error) {
      console.error(`Error fetching message ${message.id}:`, error);
    }
  }

  return messages;
}

/**
 * Get all messages in a specific Gmail thread
 */
export async function getGmailThread(
  userId: string,
  threadId: string
): Promise<GmailThread | null> {
  const gmail = await getGmailClient(userId);

  try {
    const thread = await gmail.users.threads.get({
      userId: "me",
      id: threadId,
      format: "full",
    });

    if (!thread.data.messages) {
      return null;
    }

    const messages: GmailMessage[] = [];
    let hasStreetEasyLink = false;

    for (const message of thread.data.messages) {
      const headers = message.payload?.headers || [];
      const subject =
        headers.find((h) => h.name === "Subject")?.value || "(No Subject)";
      const from = headers.find((h) => h.name === "From")?.value || "";
      const to = headers.find((h) => h.name === "To")?.value || "";
      const dateStr = headers.find((h) => h.name === "Date")?.value || "";
      const date = dateStr ? new Date(dateStr) : new Date();

      // Extract email body
      let body = "";
      if (message.payload?.parts) {
        // Multipart message
        const textPart = message.payload.parts.find(
          (part) => part.mimeType === "text/plain"
        );
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
        }
      } else if (message.payload?.body?.data) {
        // Simple message
        body = Buffer.from(
          message.payload.body.data,
          "base64"
        ).toString("utf-8");
      }

      // Check for StreetEasy URLs
      const streetEasyRegex =
        /https?:\/\/(www\.)?streeteasy\.com\/[^\s<>]*/gi;
      const streetEasyUrls = body.match(streetEasyRegex) || [];
      if (streetEasyUrls.length > 0) {
        hasStreetEasyLink = true;
      }

      messages.push({
        id: message.id!,
        threadId: thread.data.id!,
        subject,
        from,
        to,
        date,
        snippet: message.snippet || "",
        body,
        hasStreetEasyLink: streetEasyUrls.length > 0,
        streetEasyUrls,
      });
    }

    // Sort messages by date (oldest first)
    messages.sort((a, b) => a.date.getTime() - b.date.getTime());

    const lastMessage = messages[messages.length - 1];

    return {
      id: thread.data.id!,
      messages,
      subject: messages[0]?.subject || "(No Subject)",
      snippet: lastMessage?.snippet || "",
      hasStreetEasyLink,
      lastMessageDate: lastMessage?.date || new Date(),
      messageCount: messages.length,
    };
  } catch (error) {
    console.error(`Error fetching thread ${threadId}:`, error);
    return null;
  }
}

/**
 * Get combined body text from all messages in a thread
 * Useful for generating summaries or extracting information from entire conversation
 */
export function getCombinedThreadBody(thread: GmailThread): string {
  return thread.messages
    .map((msg, idx) => {
      const separator = idx === 0 ? "" : "\n\n---\n\n";
      return `${separator}From: ${msg.from}\nDate: ${msg.date.toISOString()}\nSubject: ${msg.subject}\n\n${msg.body}`;
    })
    .join("");
}
