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
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProduct() {
  const productId = 'd09213f7-6f14-44e1-ae99-06da53122e69';
  
  console.log(`\n🔍 Checking product: ${productId}\n`);
  
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  if (!product) {
    console.log('❌ Product not found');
    return;
  }
  
  console.log('📦 Product:', product.name);
  console.log('📁 Category:', product.category);
  console.log('📝 Description length:', product.description?.length || 0);
  console.log('\n🖼️  Images array:');
  console.log(JSON.stringify(product.images, null, 2));
  console.log('\n📊 Total images:', product.images?.length || 0);
  
  if (product.images && product.images.length > 0) {
    console.log('\n🔗 Image URLs:');
    product.images.forEach((img, i) => {
      console.log(`  ${i + 1}. ${img}`);
    });
  }
}

checkProduct();
