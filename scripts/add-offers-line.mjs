import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read and parse .env.local from admin folder
const envPath = join(__dirname, '..', 'admin', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    // Remove quotes if present
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

const offersLine = 'Offers welcome - get in touch - mailto:sales@urbanbees.co.uk?subject=Offer%20on%20items%20for%20sale';

async function addOffersLineToProducts() {
  console.log('🔍 Fetching all products...\n');
  
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, description')
    .order('name');
  
  if (error) {
    console.error('❌ Error fetching products:', error);
    return;
  }
  
  console.log(`📦 Found ${products.length} products\n`);
  
  let updatedCount = 0;
  let skippedCount = 0;
  
  for (const product of products) {
    const description = product.description || '';
    
    // Check if the offers line already exists
    if (description.includes('Offers welcome - get in touch')) {
      console.log(`⏭️  SKIP: "${product.name}" - already has offers line`);
      skippedCount++;
      continue;
    }
    
    // Add the offers line on a new line at the end
    const newDescription = description.trim() 
      ? `${description.trim()}\n\n${offersLine}`
      : offersLine;
    
    // Update the product
    const { error: updateError } = await supabase
      .from('products')
      .update({ description: newDescription })
      .eq('id', product.id);
    
    if (updateError) {
      console.error(`❌ ERROR updating "${product.name}":`, updateError);
    } else {
      console.log(`✅ UPDATED: "${product.name}"`);
      updatedCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Updated: ${updatedCount}`);
  console.log(`   ⏭️  Skipped: ${skippedCount}`);
  console.log(`   📦 Total: ${products.length}`);
}

addOffersLineToProducts();
