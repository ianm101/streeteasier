"use server";

export interface StreetEasyData {
  photoUrls: string[];
  price?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  address?: string;
  neighborhood?: string;
  description?: string;
}

/**
 * Scrapes a StreetEasy listing page for photos and details
 * Note: StreetEasy may have anti-scraping measures. This is a basic implementation.
 */
export async function scrapeStreetEasyListing(url: string): Promise<StreetEasyData> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.google.com/',
      },
    });

    if (!response.ok) {
      console.error(`StreetEasy fetch failed with status ${response.status} for URL: ${url}`);
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();

    // Extract photo URLs from the HTML
    // StreetEasy typically has images in various formats, let's extract them
    const photoUrls: string[] = [];

    // Look for Open Graph images (main listing image)
    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (ogImageMatch) {
      photoUrls.push(ogImageMatch[1]);
    }

    // Look for gallery images
    // StreetEasy uses various patterns, let's try to find image URLs
    const imageMatches = html.matchAll(/https:\/\/[^"\s]*streeteasy[^"\s]*\.(jpg|jpeg|png|webp)/gi);
    for (const match of imageMatches) {
      const imageUrl = match[0];
      // Filter out small/icon images
      if (!imageUrl.includes('icon') && !imageUrl.includes('logo') && !photoUrls.includes(imageUrl)) {
        photoUrls.push(imageUrl);
      }
    }

    // Look for schema.org structured data which often contains images
    const schemaMatch = html.match(/<script type="application\/ld\+json">(\{[\s\S]*?\})<\/script>/);
    if (schemaMatch) {
      try {
        const schema = JSON.parse(schemaMatch[1]);
        if (schema.image) {
          if (Array.isArray(schema.image)) {
            photoUrls.push(...schema.image.filter((img: string) => !photoUrls.includes(img)));
          } else if (typeof schema.image === 'string') {
            if (!photoUrls.includes(schema.image)) {
              photoUrls.push(schema.image);
            }
          }
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }

    // Extract other details
    const priceMatch = html.match(/\$([0-9,]+)/);
    const bedsMatch = html.match(/([0-9.]+)\s*(?:bed|BR)/i);
    const bathsMatch = html.match(/([0-9.]+)\s*(?:bath|BA)/i);
    const sqftMatch = html.match(/([0-9,]+)\s*(?:sq\.?\s*ft|sqft)/i);

    return {
      photoUrls: photoUrls.slice(0, 20), // Limit to 20 images
      price: priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : undefined,
      beds: bedsMatch ? parseFloat(bedsMatch[1]) : undefined,
      baths: bathsMatch ? parseFloat(bathsMatch[1]) : undefined,
      sqft: sqftMatch ? parseInt(sqftMatch[1].replace(/,/g, '')) : undefined,
    };
  } catch (error) {
    console.error('Error scraping StreetEasy:', error);
    return {
      photoUrls: [],
    };
  }
}

/**
 * Test function to verify scraping works
 */
export async function testStreetEasyScraping(url: string) {
  console.log('Testing StreetEasy scraping for:', url);
  const data = await scrapeStreetEasyListing(url);
  console.log('Scraped data:', {
    photoCount: data.photoUrls.length,
    photoUrls: data.photoUrls.slice(0, 3), // Show first 3
    price: data.price,
    beds: data.beds,
    baths: data.baths,
    sqft: data.sqft,
  });
  return data;
}
