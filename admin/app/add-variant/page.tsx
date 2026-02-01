// product-admin\app\add-variant\page.tsx

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import type { ProductOption } from '@/types/database';

export default function AddVariantPage() {
  const router = useRouter();

  // Load products from products table (with UUID ids)
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productId, setProductId] = useState('');
  const [price, setPrice] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [sku, setSku] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .order('name');

      if (!error && data) setProducts(data);
    }

    loadProducts();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('variants').insert([
      {
        product_id: productId,
        price: Number(price),
        stock_qty: Number(stockQty),
        sku: sku || null,
        option_values: {},
      },
    ]);

    setLoading(false);

    if (error) {
      console.error('Variant insert error:', error);
      alert(`Failed to save variant: ${error.message || 'Unknown error'}. Check if the 'variants' table exists in Supabase.`);
      return;
    }

    alert('Variant saved successfully!');
    router.push('/');
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Add Variant</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Product dropdown from products table */}
        <select
          className="w-full p-2 border rounded"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
        >
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="SKU (optional)"
          className="w-full p-2 border rounded"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price"
          className="w-full p-2 border rounded"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Stock quantity"
          className="w-full p-2 border rounded"
          value={stockQty}
          onChange={(e) => setStockQty(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-2 rounded"
        >
          {loading ? 'Saving…' : 'Save Variant'}
        </button>
      </form>
    </div>
  );
}