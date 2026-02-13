/**
 * URL Shortening Utility
 * Uses is.gd API (free, no API key required)
 * Falls back to original URL if shortening fails
 */

const URL_REGEX = /(https?:\/\/[^\s)]+)/g;
const SHORT_URL_THRESHOLD = 40; // URLs shorter than this won't be shortened
const EXCLUDED_DOMAINS = ['is.gd', 'bit.ly', 'tinyurl.com', 'goo.gl', 't.co'];

/**
 * Check if URL is already short or from a shortening service
 */
function shouldShortenUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Don't shorten if already from a shortening service
    if (EXCLUDED_DOMAINS.some(domain => hostname.includes(domain))) {
      return false;
    }
    
    // Don't shorten if URL is already short
    if (url.length <= SHORT_URL_THRESHOLD) {
      return false;
    }
    
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Shorten a single URL using is.gd API
 */
async function shortenUrl(longUrl: string): Promise<string> {
  try {
    // URL encode the long URL
    const encodedUrl = encodeURIComponent(longUrl);
    
    // is.gd API (free, no API key)
    const response = await fetch(`https://is.gd/create.php?format=json&url=${encodedUrl}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`is.gd API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.shorturl) {
      console.log(`✅ Shortened: ${longUrl} → ${data.shorturl}`);
      return data.shorturl;
    }
    
    throw new Error('No shorturl in response');
  } catch (error) {
    console.error(`❌ Failed to shorten URL: ${longUrl}`, error);
    return longUrl; // Return original URL on failure
  }
}

/**
 * Process description and shorten all URLs
 * @param description - Product description text
 * @returns Description with shortened URLs
 */
export async function shortenUrlsInDescription(description: string): Promise<string> {
  if (!description || !description.trim()) {
    return description;
  }
  
  // Find all URLs in the description
  const urls = description.match(URL_REGEX) || [];
  
  if (urls.length === 0) {
    return description;
  }
  
  console.log(`📎 Found ${urls.length} URL(s) in description`);
  
  // Filter to only URLs that should be shortened
  const urlsToShorten = urls.filter(shouldShortenUrl);
  
  if (urlsToShorten.length === 0) {
    console.log('ℹ️ No URLs need shortening (already short or excluded)');
    return description;
  }
  
  console.log(`🔗 Shortening ${urlsToShorten.length} URL(s)...`);
  
  // Shorten URLs in parallel
  const shorteningPromises = urlsToShorten.map(url => 
    shortenUrl(url).then(shortened => ({ original: url, shortened }))
  );
  
  const results = await Promise.all(shorteningPromises);
  
  // Replace URLs in description
  let updatedDescription = description;
  results.forEach(({ original, shortened }) => {
    if (shortened !== original) {
      // Replace all occurrences of the original URL
      updatedDescription = updatedDescription.split(original).join(shortened);
    }
  });
  
  const successCount = results.filter(r => r.shortened !== r.original).length;
  console.log(`✅ Successfully shortened ${successCount} of ${urlsToShorten.length} URLs`);
  
  return updatedDescription;
}
