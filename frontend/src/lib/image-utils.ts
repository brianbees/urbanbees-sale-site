/**
 * Image utility functions for optimizing image loading
 */

/**
 * Generate a thumbnail URL from a Supabase Storage image URL
 * Adds transformation parameters to reduce file size and dimensions
 * 
 * @param imageUrl - Original image URL
 * @param width - Desired width in pixels (default: 200)
 * @param quality - JPEG quality 1-100 (default: 75)
 * @returns Optimized thumbnail URL
 */
export function getThumbnailUrl(
  imageUrl: string,
  width: number = 200,
  quality: number = 75
): string {
  // Return placeholder as-is
  if (!imageUrl || imageUrl.includes('/placeholder.jpg')) {
    return imageUrl;
  }

  // Check if it's a Supabase Storage URL
  const supabaseStoragePattern = /supabase\.co\/storage\/v1\/object\/public\//;
  
  if (!supabaseStoragePattern.test(imageUrl)) {
    // Not a Supabase URL, return as-is
    return imageUrl;
  }

  // Add transformation parameters
  // Supabase supports: width, height, quality, resize mode
  const separator = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${separator}width=${width}&quality=${quality}`;
}

/**
 * Generate thumbnail URL with specific dimensions for different contexts
 */
export const thumbnailSizes = {
  /** Very small thumbnail for compact lists (24-30px display) */
  tiny: (url: string) => getThumbnailUrl(url, 80, 70),
  
  /** Small thumbnail for list/grid views (50-100px display) */
  small: (url: string) => getThumbnailUrl(url, 150, 75),
  
  /** Medium thumbnail for cards (100-200px display) */
  medium: (url: string) => getThumbnailUrl(url, 250, 80),
  
  /** Large thumbnail for preview (200-400px display) */
  large: (url: string) => getThumbnailUrl(url, 400, 85),
};
