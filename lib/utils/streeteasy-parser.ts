/**
 * Parse StreetEasy HTML emails to extract listing details using Claude Haiku
 */

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface StreetEasyListing {
  address: string;
  unit?: string;
  price: number | null;
  beds: number | null;
  baths: number | null;
  imageUrl: string | null;
  listingUrl: string;
  neighborhood?: string;
}

/**
 * Extract listing details from StreetEasy HTML email content using Claude Haiku
 */
export async function parseStreetEasyListings(htmlContent: string): Promise<StreetEasyListing[]> {
  // First, extract all StreetEasy URLs from the HTML
  const streetEasyRegex = /https?:\/\/(www\.)?streeteasy\.com\/[^\s<>"]+/gi;
  const streetEasyUrls = [...new Set(htmlContent.match(streetEasyRegex) || [])].map(url =>
    url.replace(/&amp;/g, '&')
  );

  if (streetEasyUrls.length === 0) {
    return [];
  }

  // Also extract all image URLs for matching
  const imgRegex = /<img[^>]+src="([^"]+)"/gi;
  const imageUrls: string[] = [];
  let imgMatch;
  while ((imgMatch = imgRegex.exec(htmlContent)) !== null) {
    imageUrls.push(imgMatch[1]);
  }

  const prompt = `You are extracting apartment listing details from a StreetEasy email HTML.

The email contains ${streetEasyUrls.length} StreetEasy listing URL(s):
${streetEasyUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}

Available images in email: ${imageUrls.length} total

HTML Content (truncated):
${htmlContent.substring(0, 15000)}

For EACH StreetEasy URL above, extract the listing details by analyzing the HTML content near that URL. Return ONLY a JSON array with this structure:

[
  {
    "address": "Street address without unit (e.g., '264 West 25th Street')",
    "unit": "Unit number if present (e.g., '4E'), or null",
    "price": Monthly rent as number without $ or commas (e.g., 8495),
    "beds": Number of bedrooms as number (e.g., 3),
    "baths": Number of bathrooms as number (e.g., 2),
    "imageUrl": "First/best image URL for this specific listing from the email, or null",
    "listingUrl": "The StreetEasy URL for this listing (must be one from the list above)",
    "neighborhood": "NYC neighborhood name (e.g., 'Chelsea'), or null"
  }
]

Guidelines:
- Return one object per StreetEasy URL
- Look for price patterns like "$8,495", "8495/mo", "$8,495 base rent"
- Look for bed/bath patterns like "3 Beds", "2 Baths", "3 Bed / 2 Bath"
- Match each listing to its corresponding image (usually appears right before or after the listing details)
- If you cannot find a specific field, use null
- Ensure every URL from the list above has a corresponding entry in the array

Return ONLY the JSON array, no other text.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4",  // Fast, cheap model
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Could not extract JSON array from AI response:", responseText);
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed as StreetEasyListing[];
  } catch (error) {
    console.error("Error parsing StreetEasy listings with AI:", error);
    return [];
  }
}

/**
 * Extract broker information from email HTML/text
 */
export function extractBrokerInfo(htmlContent: string, textContent: string): {
  name: string | null;
  email: string | null;
  phone: string | null;
} {
  const combinedContent = htmlContent + ' ' + textContent;

  // Look for common broker signature patterns
  const nameMatch = combinedContent.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)\s*\|/);
  const emailMatch = combinedContent.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const phoneMatch = combinedContent.match(/(?:Cell|Phone|Tel):\s*(\d{3}[-.]?\d{3}[-.]?\d{4})/i);

  return {
    name: nameMatch ? nameMatch[1] : null,
    email: emailMatch ? emailMatch[1] : null,
    phone: phoneMatch ? phoneMatch[1] : null,
  };
}
