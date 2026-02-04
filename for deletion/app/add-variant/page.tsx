'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AddVariantPage() {
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [productId, setProductId] = useState('');
  const [price, setPrice] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [sku, setSku] = useState('');
  const [optionValues, setOptionValues] = useState('{}');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase.from('products').select('*');
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
        sku,
        option_values: JSON.parse(optionValues),
      },
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      return;
    }

    router.push('/');
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Add Variant</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

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

        <textarea
          placeholder='Option values (JSON) e.g. {"size":"Large"}'
          className="w-full p-2 border rounded"
          rows={3}
          value={optionValues}
          onChange={(e) => setOptionValues(e.target.value)}
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
