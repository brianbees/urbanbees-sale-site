'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useWishlistStore } from '@/store/wishlist';
import ForPrintClient from './ForPrintClient';

interface Product {
  id: string;
  name: string;
  description: string;
  images?: string[];
  price?: number;
  sku?: string;
  quantity?: number;
  category?: string;
}

export default function ForPrintPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') as 'all' | 'wishlist' || 'all';
  const { items: wishlistItems } = useWishlistStore();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      if (mode === 'wishlist') {
        // Convert wishlist items to product format
        const wishlistProducts = wishlistItems.map(item => ({
          id: item.productId,
          name: item.productName,
          description: '',
          images: item.image ? [item.image] : [],
          price: item.price || undefined,
          sku: undefined,
          quantity: undefined,
          category: item.category,
        }));
        setProducts(wishlistProducts);
        setLoading(false);
      } else {
        // Fetch all products from database
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('id, name, description, images, variants(id, sku, price, stock_qty)');

        if (fetchError) {
          setError('Error loading products');
          setLoading(false);
          return;
        }

        // Map products to include first variant's details
        const productsWithVariant = (data ?? []).map((product: any) => {
          const variant = product.variants?.[0] || {};
          return {
            ...product,
            price: variant.price,
            sku: variant.sku,
            quantity: variant.stock_qty,
          };
        });

        setProducts(productsWithVariant);
        setLoading(false);
      }
    }

    loadProducts();
  }, [mode, wishlistItems]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No products to print</p>
      </div>
    );
  }

  return <ForPrintClient products={products} mode={mode} />;
}
