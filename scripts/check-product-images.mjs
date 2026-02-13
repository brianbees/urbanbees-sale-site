import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pdovgefwzxfawuyngrke.supabase.co';
const supabaseKey = 'sb_publishable_i0DqtdlAYPAjxn_eEPUi3Q_0eeiCxpD';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProduct() {
  const productId = 'b060c17a-2cb7-4ed3-b560-91964733e71f';
  
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
