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
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'set' : 'NOT SET');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? 'set' : 'NOT SET');
  process.exit(1);
}

// Use service role key for write operations
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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
    
    // Remove old offer text if it exists
    currentDesc = currentDesc.replace(oldOfferText, '');
    
    // Remove new offer text if it already exists (to avoid duplicates on re-runs)
    const emailPattern = /\nOffers welcome - get in touch - mailto:sales@urbanbees\.co\.uk\?subject=.*$/;
    currentDesc = currentDesc.replace(emailPattern, '');
    
    // Append the new offer text (add to all products, even if description is empty)
    const newDescription = currentDesc.trim() ? currentDesc.trim() + newOfferText : newOfferText.trim();

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
