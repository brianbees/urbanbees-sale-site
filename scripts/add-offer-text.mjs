import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pdovgefwzxfawuyngrke.supabase.co';
const serviceRoleKey = 'sb_secret_rTpRmXlcDW3zQA9oM_MMcw_P6hqCwKm';

// Use service role key for write operations
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function addOfferText() {
  console.log('Fetching all products...');
  
  // Fetch all products
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('*');

  if (fetchError) {
    console.error('Error fetching products:', fetchError);
    return;
  }

  console.log(`Found ${products.length} products`);

  const oldOfferText = ' or make an offer';
  const newOfferText = '\nOffers welcome - get in touch - mailto:sales@urbanbees.co.uk?subject=Offer%20on%20items%20for%20sale';
  let updatedCount = 0;
  let skippedCount = 0;

  for (const product of products) {
    let currentDesc = product.description || '';
    
    // Skip if description is empty
    if (!currentDesc.trim()) {
      console.log(`Skipped: ${product.name} (no description)`);
      skippedCount++;
      continue;
    }

    // Remove old offer text if it exists
    currentDesc = currentDesc.replace(oldOfferText, '');
    
    // Remove new offer text if it already exists (to avoid duplicates on re-runs)
    const emailPattern = /\nOffers welcome - get in touch - mailto:sales@urbanbees\.co\.uk\?subject=.*$/;
    currentDesc = currentDesc.replace(emailPattern, '');
    
    // Append the new offer text
    const newDescription = currentDesc.trim() + newOfferText;

    // Update the product
    const { error: updateError } = await supabase
      .from('products')
      .update({ description: newDescription })
      .eq('id', product.id);

    if (updateError) {
      console.error(`Error updating ${product.name}:`, updateError);
    } else {
      console.log(`✅ Updated: ${product.name}`);
      updatedCount++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Total products: ${products.length}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Skipped: ${skippedCount}`);
}

addOfferText().catch(console.error);
