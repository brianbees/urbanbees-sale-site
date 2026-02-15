/**
 * Script to find and clean broken image URLs from products
 * Checks all product images for 404 errors and reports/removes them
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read credentials from admin/.env.local
const envPath = join(__dirname, '..', 'admin', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    envVars[key] = value;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in admin/.env.local');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'set' : 'NOT SET');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'set' : 'NOT SET');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Check if an image URL is accessible
 */
async function checkImageExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Find all broken image URLs in the database
 */
async function findBrokenImages() {
  console.log('🔍 Fetching all products...\n');
  
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, images');

  if (error) {
    console.error('❌ Error fetching products:', error);
    return [];
  }

  console.log( `📦 Found ${products.length} products\n`);

  const brokenImages = [];
  let totalImages = 0;
  let brokenCount = 0;

  for (const product of products) {
    if (!product.images || product.images.length === 0) {
      continue;
    }

    console.log(`Checking "${product.name}" (${product.images.length} images)...`);

    for (let i = 0; i < product.images.length; i++) {
      const imageUrl = product.images[i];
      totalImages++;
      
      const exists = await checkImageExists(imageUrl);
      
      if (!exists) {
        brokenCount++;
        console.log(`  ❌ Broken image at position ${i + 1}: ${imageUrl}`);
        brokenImages.push({
          productId: product.id,
          productName: product.name,
          imageUrl: imageUrl,
          position: i,
          allImages: product.images
        });
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`📊 Summary: ${brokenCount} broken out of ${totalImages} total images`);
  console.log('='.repeat(80) + '\n');

  return brokenImages;
}

/**
 * Remove broken images from the database
 */
async function removeBrokenImages(brokenImages) {
  console.log('🧹 Removing broken images from database...\n');

  for (const item of brokenImages) {
    const newImages = item.allImages.filter(url => url !== item.imageUrl);
    
    const { error } = await supabase
      .from('products')
      .update({ images: newImages })
      .eq('id', item.productId);

    if (error) {
      console.error(`  ❌ Failed to update "${item.productName}":`, error.message);
    } else {
      console.log(`  ✅ Removed broken image from "${item.productName}"`);
    }
  }

  console.log(`\n✨ Cleanup complete! Removed ${brokenImages.length} broken images.\n`);
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🐝 Urban Bees - Broken Image Cleaner\n');
  console.log('='.repeat(80) + '\n');

  const brokenImages = await findBrokenImages();

  if (brokenImages.length === 0) {
    console.log('✅ No broken images found! All product images are working.\n');
    return;
  }

  console.log('\n📋 Broken Images Report:\n');
  brokenImages.forEach((item, index) => {
    console.log(`${index + 1}. Product: "${item.productName}"`);
    console.log(`   Position: ${item.position + 1}`);
    console.log(`   URL: ${item.imageUrl}\n`);
  });

  // Check for --fix flag
  const shouldFix = process.argv.includes('--fix');

  if (shouldFix) {
    await removeBrokenImages(brokenImages);
  } else {
    console.log('💡 To automatically remove these broken images, run:');
    console.log('   node scripts/clean-broken-images.mjs --fix\n');
  }
}

main().catch(console.error);
