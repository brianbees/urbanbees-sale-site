import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pdovgefwzxfawuyngrke.supabase.co';
const supabaseKey = 'sb_publishable_i0DqtdlAYPAjxn_eEPUi3Q_0eeiCxpD';

const supabase = createClient(supabaseUrl, supabaseKey);

const { data, error } = await supabase
  .from('products')
  .select('id, name, images')
  .eq('id', '586867ea-51f0-4bd1-94eb-2ae2182ba34b')
  .single();

if (error) {
  console.error('Error:', error);
} else {
  console.log('Product:', data.name);
  console.log('Images array:', JSON.stringify(data.images, null, 2));
  console.log('Number of images:', data.images?.length || 0);
}
