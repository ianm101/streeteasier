/**
 * Parse StreetEasy HTML emails to extract listing details
 */

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
 * Extract listing details from StreetEasy HTML email content
 */
export function parseStreetEasyListings(htmlContent: string): StreetEasyListing[] {
  const listings: StreetEasyListing[] = [];

  // StreetEasy sends listings in structured divs with specific patterns
  // Extract rental unit information
  const rentalUnitPattern = /RENTAL UNIT IN ([A-Z\s]+)\s*<\/[^>]+>\s*<[^>]+>([^<]+)<\/[^>]+>\s*<[^>]+>\$([0-9,]+)/gi;
  let match;

  while ((match = rentalUnitPattern.exec(htmlContent)) !== null) {
    const neighborhood = match[1].trim();
    const address = match[2].trim();
    const priceStr = match[3].replace(/,/g, '');
    const price = parseInt(priceStr, 10);

    // Extract listing URL - look for streeteasy.com link near this listing
    const contextStart = Math.max(0, match.index - 500);
    const contextEnd = Math.min(htmlContent.length, match.index + 1000);
    const context = htmlContent.substring(contextStart, contextEnd);

    const urlMatch = context.match(/https?:\/\/(?:www\.)?streeteasy\.com\/[^"\s<>]+/);
    const listingUrl = urlMatch ? urlMatch[0].replace(/&amp;/g, '&') : '';

    // Extract beds/baths info
    const bedsMatch = context.match(/(\d+)\s*Beds?/i);
    const bathsMatch = context.match(/(\d+)\s*Baths?/i);
    const beds = bedsMatch ? parseInt(bedsMatch[1], 10) : null;
    const baths = bathsMatch ? parseInt(bathsMatch[1], 10) : null;

    // Extract image URL
    const imgMatch = context.match(/<img[^>]+src="([^"]+)"/);
    const imageUrl = imgMatch ? imgMatch[1] : null;

    // Parse address to separate unit number
    let unit: string | undefined;
    const unitMatch = address.match(/(.+?)\s+#?([A-Z0-9]+)$/);
    const cleanAddress = unitMatch ? unitMatch[1] : address;
    unit = unitMatch ? unitMatch[2] : undefined;

    if (listingUrl) {
      listings.push({
        address: cleanAddress,
        unit,
        price,
        beds,
        baths,
        imageUrl,
        listingUrl,
        neighborhood,
      });
    }
  }

  // Alternative pattern for listings without "RENTAL UNIT IN" header
  // Look for price patterns followed by bed/bath info
  const altPattern = /\$([0-9,]+)[^<]*base rent[^<]*<[^>]*>[\s\S]*?(\d+)\s*Beds?[^<]*<[^>]*>[\s\S]*?(\d+)\s*Baths?/gi;

  while ((match = altPattern.exec(htmlContent)) !== null) {
    const priceStr = match[1].replace(/,/g, '');
    const price = parseInt(priceStr, 10);
    const beds = parseInt(match[2], 10);
    const baths = parseInt(match[3], 10);

    // Find address near this price
    const contextStart = Math.max(0, match.index - 500);
    const contextEnd = Math.min(htmlContent.length, match.index + 500);
    const context = htmlContent.substring(contextStart, contextEnd);

    const addressMatch = context.match(/(\d+\s+[NESW](?:orth|outh|ast|est)?\.?\s+\w+(?:\s+\w+)*\s+(?:Street|Avenue|Ave|St|Road|Rd))\s*(?:#([A-Z0-9]+))?/i);

    if (addressMatch) {
      const address = addressMatch[1].trim();
      const unit = addressMatch[2];

      const urlMatch = context.match(/https?:\/\/(?:www\.)?streeteasy\.com\/[^"\s<>]+/);
      const listingUrl = urlMatch ? urlMatch[0].replace(/&amp;/g, '&') : '';

      const imgMatch = context.match(/<img[^>]+src="([^"]+)"/);
      const imageUrl = imgMatch ? imgMatch[1] : null;

      if (listingUrl && !listings.find(l => l.listingUrl === listingUrl)) {
        listings.push({
          address,
          unit,
          price,
          beds,
          baths,
          imageUrl,
          listingUrl,
        });
      }
    }
  }

  return listings;
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
