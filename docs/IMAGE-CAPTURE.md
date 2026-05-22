# Image Capture from StreetEasy Listings

## Current Status

The application includes a StreetEasy scraper (`lib/scrapers/streeteasy.ts`) that attempts to extract photo URLs from listing pages. However, **StreetEasy implements anti-scraping measures** that block direct HTTP requests (403 Forbidden).

## Test Results

```bash
npx tsx scripts/test-streeteasy-scraper.ts "https://streeteasy.com/building/200-w-26th-street-new_york"

# Result: 403 Forbidden
# photoCount: 0
# photoUrls: []
```

## Why This Happens

1. **Bot Detection**: StreetEasy uses Cloudflare or similar services to detect automated requests
2. **IP Blocking**: Server-side requests from known cloud providers are blocked
3. **Anti-Scraping Policy**: StreetEasy actively prevents automated data extraction

## Alternative Solutions

### Option 1: Browser-Based Extension (Recommended for MVP)
**Manual but reliable:**
- User clicks a browser extension button when viewing a StreetEasy listing
- Extension extracts photos and data from the rendered page
- Data is sent to the app via API

**Pros:**
- Works reliably (browser = real user)
- No scraping detection
- Can extract all visible data

**Cons:**
- Manual step required
- Need to build browser extension

### Option 2: Headless Browser (Puppeteer/Playwright)
**Automated but complex:**
```typescript
import puppeteer from 'puppeteer';

async function scrapeWithBrowser(url: string) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);

  const photos = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img[src*="streeteasy"]'));
    return images.map(img => img.src);
  });

  await browser.close();
  return photos;
}
```

**Pros:**
- Fully automated
- Can extract all rendered content

**Cons:**
- Resource intensive (CPU, memory)
- Slower (2-5 seconds per page)
- May still be detected
- Requires additional dependencies

### Option 3: StreetEasy API (If Available)
**Check if StreetEasy offers:**
- Official API access
- Partner program
- Data licensing

**Status:** Unknown - needs research

### Option 4: Manual Photo Upload
**Simplest workaround:**
- User manually uploads photos when creating listing
- Or: User pastes image URLs from StreetEasy

**Pros:**
- Always works
- No technical complexity

**Cons:**
- Manual work
- Slow

## Current Implementation

The code is structured to support photo scraping:

1. `lib/scrapers/streeteasy.ts` - Scraper implementation (currently blocked)
2. `lib/actions/apartments.ts` - Calls scraper when creating apartments
3. `components/ApartmentCard.tsx` - Displays photos in carousel
4. Database schema includes `photoUrls: String[]` field

**When scraping fails (current state):**
- Apartments are created without photos
- Cards show placeholder image
- All other data (price, beds, baths) works fine

## Recommendations

For the MVP:

1. **Accept the limitation**: Users can still track apartments without photos
2. **Add manual upload**: Allow users to upload/paste image URLs
3. **Future enhancement**: Build browser extension or use Puppeteer

## Testing Image Display

Even without scraping, you can test the image carousel by manually adding photo URLs to an apartment:

```typescript
await prisma.apartment.update({
  where: { id: 'apartment-id' },
  data: {
    photoUrls: [
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg',
      'https://example.com/photo3.jpg',
    ]
  }
});
```

The card carousel will work perfectly once photoUrls are populated.
