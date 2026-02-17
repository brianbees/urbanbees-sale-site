import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read admin .env.local for service key
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
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'set' : 'NOT SET');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'set' : 'NOT SET');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addProductNameToVariants() {
  console.log('🔧 Adding product_name column to variants table...\n');
  
  // Step 1: Add column (this is done via Supabase SQL Editor - just documenting)
  console.log('Step 1: Add column via Supabase SQL Editor:');
  console.log('  ALTER TABLE variants ADD COLUMN IF NOT EXISTS product_name TEXT;');
  console.log('  (Run this in your Supabase SQL Editor first)\n');
  
  console.log('Waiting for confirmation that column was added...');
  console.log('Press Ctrl+C if you haven\'t added it yet, or wait 3 seconds to continue...\n');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Step 2: Fetch all variants and products
  console.log('📦 Fetching variants and products...\n');
  
  const { data: variants, error: variantsError } = await supabase
    .from('variants')
    .select('id, product_id');
  
  if (variantsError) {
    console.error('❌ Error fetching variants:', variantsError);
    return;
  }
  
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name');
  
  if (productsError) {
    console.error('❌ Error fetching products:', productsError);
    return;
  }
  
  // Create product map for quick lookup
  const productMap = new Map(products.map(p => [p.id, p.name]));
  
  console.log(`Found ${variants.length} variants and ${products.length} products\n`);
  
  // Step 3: Update each variant with product name
  let successCount = 0;
  let errorCount = 0;
  
  for (const variant of variants) {
    const productName = productMap.get(variant.product_id);
    
    if (!productName) {
      console.log(`⚠️  Variant ${variant.id}: No matching product found`);
      errorCount++;
      continue;
    }
    
    const { error } = await supabase
      .from('variants')
      .update({ product_name: productName })
      .eq('id', variant.id);
    
    if (error) {
      console.error(`❌ Variant ${variant.id}: Update failed -`, error.message);
      errorCount++;
    } else {
      successCount++;
      if (successCount % 10 === 0) {
        console.log(`✅ Updated ${successCount} variants...`);
      }
    }
  }
  
  console.log(`\n📊 Migration Complete:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📦 Total: ${variants.length}`);
}

console.log('🚀 Starting migration: Add product_name to variants\n');
console.log('⚠️  IMPORTANT: Run this SQL in Supabase SQL Editor first:');
console.log('   ALTER TABLE variants ADD COLUMN IF NOT EXISTS product_name TEXT;\n');

addProductNameToVariants();
