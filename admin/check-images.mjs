import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pdovgefwzxfawuyngrke.supabase.co';
const supabaseKey = 'sb_publishable_i0DqtdlAYPAjxn_eEPUi3Q_0eeiCxpD';

const supabase = createClient(supabaseUrl, supabaseKey);

const { data, error } = await supabase
  .from('products')
  .select('id, name');

if (error) {
  console.error('Error:', error);
} else {
  console.log('Total products in database:', data.length);
}
