import { testStreetEasyScraping } from '../lib/scrapers/streeteasy';

// Test with a sample StreetEasy URL
const testUrl = process.argv[2] || 'https://streeteasy.com/building/121-madison-avenue-new_york/9h';

console.log('\n=== Testing StreetEasy Scraper ===\n');

testStreetEasyScraping(testUrl)
  .then(() => {
    console.log('\n=== Test Complete ===\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n=== Test Failed ===');
    console.error(error);
    process.exit(1);
  });
