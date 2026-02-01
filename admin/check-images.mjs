import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pdovgefwzxfawuyngrke.supabase.co';
const supabaseKey = 'sb_publishable_i0DqtdlAYPAjxn_eEPUi3Q_0eeiCxpD';

const supabase = createClient(supabaseUrl, supabaseKey);

const { data, error } = await supabase
  .from('products')
  .select('id, name, images')
  .eq('id', 'c113d4eb-a2d8-42ae-808d-4c3198bb28d1')
  .single();

if (error) {
  console.error('Error:', error);
} else {
  console.log('Product:', data.name);
  console.log('Images array:', JSON.stringify(data.images, null, 2));
  console.log('Number of images:', data.images?.length || 0);
}
