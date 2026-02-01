// Import existing products from products.ts into Supabase database
// Run with: node scripts/import-products.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read and parse products.ts file
const productsFilePath = path.join(__dirname, '../src/data/products.ts');
const productsFileContent = fs.readFileSync(productsFilePath, 'utf-8');

// Extract the products array using regex (simple approach)
const match = productsFileContent.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);
if (!match) {
  console.error('❌ Could not parse products.ts');
  process.exit(1);
}

const products = JSON.parse(match[1]);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function importProducts() {
  console.log(`📦 Starting import of ${products.length} products...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const product of products) {
    try {
      console.log(`Importing: ${product.name}`);

      // Check if product already exists by name
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('name', product.name)
        .single();

      if (existing) {
        console.log(`  ⏭️  Skipped (already exists)\n`);
        continue;
      }

      // Insert product
      const { data: insertedProduct, error: productError } = await supabase
        .from('products')
        .insert({
          name: product.name,
          category: product.category,
          description: product.description || null,
          images: product.images.map(img => img.src),
        })
        .select()
        .single();

      if (productError) throw productError;

      console.log(`  ✓ Product created (ID: ${insertedProduct.id})`);

      // Insert variants
      const validVariants = product.variants.filter(v => v.price !== null);
      
      if (validVariants.length > 0) {
        const variantInserts = validVariants.map(variant => ({
          product_id: insertedProduct.id,
          sku: variant.sku || null,
          price: variant.price,
          stock_qty: variant.stockQty || 0,
          option_values: variant.optionValues || {},
        }));

        const { error: variantError } = await supabase
          .from('variants')
          .insert(variantInserts);

        if (variantError) throw variantError;
        
        console.log(`  ✓ ${validVariants.length} variant(s) created`);
      } else {
        console.log(`  ⚠️  No variants with prices`);
      }

      console.log('');
      successCount++;

    } catch (error) {
      console.error(`  ❌ Error: ${error.message}\n`);
      errorCount++;
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Import complete!`);
  console.log(`   Success: ${successCount} products`);
  console.log(`   Errors: ${errorCount} products`);
  console.log(`   Skipped: ${products.length - successCount - errorCount} products`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

importProducts().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
