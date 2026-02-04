import { supabase } from '@/lib/supabase';

import ForPrintClient from './ForPrintClient';

export default async function ForPrintPage() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, description, images, variants(id, sku, price, stock_qty)');

  if (error) {
    return <div>Error loading products.</div>;
  }

  // Map each product to include the first variant's price, sku, and quantity
  const productsWithVariant = (products ?? []).map((product: any) => {
    const variant = product.variants?.[0] || {};
    return {
      ...product,
      price: variant.price,
      sku: variant.sku,
      quantity: variant.stock_qty,
    };
  });

  return <ForPrintClient products={productsWithVariant} />;
}
