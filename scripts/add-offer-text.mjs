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

  const offerText = ' or make an offer';
  let updatedCount = 0;
  let skippedCount = 0;

  for (const product of products) {
    const currentDesc = product.description || '';
    
    // Skip if already has the offer text
    if (currentDesc.includes(offerText)) {
      console.log(`Skipped: ${product.name} (already has offer text)`);
      skippedCount++;
      continue;
    }

    // Skip if description is empty
    if (!currentDesc.trim()) {
      console.log(`Skipped: ${product.name} (no description)`);
      skippedCount++;
      continue;
    }

    // Append the offer text
    const newDescription = currentDesc.trim() + offerText;

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
