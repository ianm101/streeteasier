import { scrapeStreetEasyListing } from "./lib/scrapers/streeteasy";

async function testScraper() {
  // Test with a real StreetEasy listing
  const testUrl = "https://streeteasy.com/building/225-eighth-avenue-chelsea/2d";

  console.log("Testing StreetEasy scraper with:", testUrl);
  console.log("---");

  const result = await scrapeStreetEasyListing(testUrl);

  console.log("Result:");
  console.log("- Photo count:", result.photoUrls.length);
  console.log("- Photos:", result.photoUrls.slice(0, 5));
  console.log("- Price:", result.price);
  console.log("- Beds:", result.beds);
  console.log("- Baths:", result.baths);
  console.log("- Sqft:", result.sqft);
}

testScraper().catch(console.error);
