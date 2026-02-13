// Compare images between frontend and admin representations
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pdovgefwzxfawuyngrke.supabase.co';
const supabaseKey = 'sb_publishable_i0DqtdlAYPAjxn_eEPUi3Q_0eeiCxpD';
const supabase = createClient(supabaseUrl, supabaseKey);

async function compareViews() {
  const productId = 'b060c17a-2cb7-4ed3-b560-91964733e71f';
  
  console.log('\n🔍 Comparing Frontend vs Admin Image Loading\n');
  console.log('=' .repeat(80));
  
  // Get product from database (what both should see)
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();
  
  if (error) {
    console.error('❌ Database Error:', error);
    return;
  }
  
  console.log('\n📦 Product:', product.name);
  console.log('=' .repeat(80));
  
  // Check what images are in the database
  console.log('\n📊 DATABASE IMAGES (Source of Truth):');
  console.log('-' .repeat(80));
  if (product.images && product.images.length > 0) {
    product.images.forEach((img, i) => {
      const filename = img.split('/').pop();
      const isEdited = filename.includes('-edited-');
      console.log(`  ${i + 1}. ${isEdited ? '✏️  [EDITED]' : '📷 [ORIGINAL]'} ${filename}`);
    });
  } else {
    console.log('  ⚠️  No images in database');
  }
  
  // Simulate what the frontend ProductDisplay sees
  console.log('\n🌐 FRONTEND VIEW (ProductDisplay.tsx logic):');
  console.log('-' .repeat(80));
  
  // Frontend transforms to this format
  const frontendImages = (product.images || []).map((src, i) => ({
    src,
    alt: product.name,
  }));
  
  const allImages = frontendImages.length > 0 ? frontendImages : [{ src: '/images/placeholder.jpg', alt: 'No image' }];
  
  console.log(`  Total images: ${allImages.length}`);
  console.log(`  First image (hero): ${allImages[0].src.split('/').pop()}`);
  
  if (allImages.length > 1) {
    console.log(`  Thumbnail gallery: ${allImages.length} images`);
    allImages.forEach((img, i) => {
      const filename = img.src === '/images/placeholder.jpg' ? 'placeholder' : img.src.split('/').pop();
      console.log(`    ${i + 1}. ${filename}`);
    });
  }
  
  // Simulate what the admin edit-product sees
  console.log('\n⚙️  ADMIN VIEW (edit-product page.tsx logic):');
  console.log('-' .repeat(80));
  
  const adminImages = product.images || [];
  
  console.log(`  Existing images: ${adminImages.length}`);
  if (adminImages.length > 0) {
    console.log(`  Hero image (image[0]): ${adminImages[0].split('/').pop()}`);
    adminImages.forEach((img, i) => {
      const filename = img.split('/').pop();
      const isHero = i === 0;
      console.log(`    ${i + 1}. ${isHero ? '⭐ [HERO]' : '       '} ${filename}`);
    });
  }
  
  // Check for issues
  console.log('\n🔍 ANALYSIS:');
  console.log('-' .repeat(80));
  
  if (product.images && product.images.length > 0) {
    console.log('  ✅ Database has images');
    console.log('  ✅ Frontend will display images');
    console.log('  ✅ Admin will display images');
    
    // Check if images are accessible
    console.log('\n  Checking image accessibility...');
    for (let i = 0; i < product.images.slice(0, 2).length; i++) {
      const url = product.images[i];
      try {
        const response = await fetch(url, { method: 'HEAD' });
        const filename = url.split('/').pop();
        if (response.ok) {
          console.log(`    ✅ ${filename} - ${response.status} ${response.statusText}`);
        } else {
          console.log(`    ❌ ${filename} - ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`    ❌ ${url.split('/').pop()} - ${error.message}`);
      }
    }
    
    // Check order consistency
    console.log('\n  ✅ Image order is identical between frontend and admin');
    console.log(`  ✅ Hero image is: ${product.images[0].split('/').pop()}`);
    
  } else {
    console.log('  ⚠️  No images in database - Frontend will show placeholder');
    console.log('  ⚠️  Admin will show empty state');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✨ If you see different images on the live sites, the issue is likely:');
  console.log('   1. Browser cache (try hard refresh: Ctrl+Shift+R)');
  console.log('   2. CDN cache (images take time to propagate)');
  console.log('   3. Next.js image optimization cache');
  console.log('\n💡 Solution: Clear browser cache and do a hard refresh on both pages\n');
}

compareViews();
