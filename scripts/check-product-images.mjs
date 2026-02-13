import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pdovgefwzxfawuyngrke.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkb3ZnZWZ3enhd2F3dXluZ3JrZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM0NjE5NjA4LCJleHAiOjIwNTAxOTU2MDh9.1e3f0TckJPPbhAFyc9dR0w6dYlMAO_HkOHcg3xGRznY';

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
