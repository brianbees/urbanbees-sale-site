'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import type { DatabaseProduct, DatabaseVariant } from '@/types/database';
import type { Product } from '@/data/products';

export default function PreviewPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [deployMessage, setDeployMessage] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Fetch products and their variants (most recently updated first)
        const { data: dbProducts, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('updated_at', { ascending: false });

        if (productsError) throw productsError;

        const { data: dbVariants, error: variantsError } = await supabase
          .from('variants')
          .select('*');

        if (variantsError) throw variantsError;

        // Transform database products to frontend format
        const transformedProducts: Product[] = (dbProducts || []).map((dbProduct: DatabaseProduct) => {
          const productVariants = (dbVariants || [])
            .filter((v: DatabaseVariant) => v.product_id === dbProduct.id)
            .map((v: DatabaseVariant) => ({
              id: v.id,
              sku: v.sku,
              optionValues: v.option_values || {},
              price: v.price,
              msrp: null,
              stockQty: v.stock_qty,
            }));

          return {
            id: dbProduct.id,
            name: dbProduct.name,
            slug: dbProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            category: dbProduct.category as any,
            description: dbProduct.description,
            features: [],
            currency: 'GBP' as const,
            options: [],
            variants: productVariants.length > 0 ? productVariants : [{
              id: 'default',
              optionValues: {},
              price: null,
              msrp: null,
              stockQty: null,
            }],
            images: (dbProduct.images || []).map((src: string) => ({
              src,
              alt: dbProduct.name,
            })).concat(
              // Add placeholder if no images
              (dbProduct.images || []).length === 0
                ? [{ src: '/images/placeholder.jpg', alt: 'No image' }]
                : []
            ),
          };
        });

        console.log('Loaded products:', transformedProducts.length);
        console.log('Sample product:', transformedProducts[0]);
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  async function handleDeploy() {
    setDeploying(true);
    setDeployMessage('🔄 Deploying changes...');

    try {
      const response = await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to deploy');
      }

      setDeployMessage('✅ Changes deployed! Live site updated.');
      setTimeout(() => setDeployMessage(''), 3000);
    } catch (error) {
      console.error('Deploy error:', error);
      setDeployMessage('❌ Deploy failed');
      setTimeout(() => setDeployMessage(''), 3000);
    } finally {
      setDeploying(false);
    }
  }

  async function handleDelete(productId: string, productName: string) {
    if (!confirm(`Are you sure you want to delete "${productName}"?\n\nThis will also delete all variants and cannot be undone.`)) {
      return;
    }

    try {
      console.log('Deleting product:', productId, productName);
      const response = await fetch('/api/delete-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const result = await response.json();
      console.log('Delete response:', response.status, result);

      if (response.ok) {
        // Remove from local state
        setProducts(products.filter(p => p.id !== productId));
        alert(`✅ Deleted: ${productName}`);
      } else {
        const errorMsg = result.error || 'Unknown error';
        console.error('Delete failed:', errorMsg);
        alert(`❌ Delete failed: ${errorMsg}\n\nCheck console for details.`);
      }
    } catch (error) {
      console.error('Delete exception:', error);
      alert(`❌ Delete failed: ${error}\n\nCheck console for details.`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Deploy Banner */}
      <div className="bg-yellow-100 border-b border-yellow-300 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-yellow-900">
                🔍 Preview Mode - Live Database
              </h2>
              <p className="text-sm text-yellow-700">
                This page shows products from your Supabase database. Changes are live immediately.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <a
                href="/"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold inline-flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
              >
                🏠 View Frontend
              </a>
              <button
                onClick={handleDeploy}
                disabled={deploying}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                {deploying ? '🔄 Deploying...' : deployMessage ? deployMessage : '🚀 Deploy Changes'}
              </button>
              <a
                href="https://urbanbees-product-admin.vercel.app/add-product"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold inline-flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
              >
                ➕ Add Product
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">
          Products Preview ({products.length} items)
        </h1>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading products from database...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <p className="text-gray-600">No products found in database.</p>
            <a
              href="https://urbanbees-product-admin.vercel.app/add-product"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              Add your first product in the admin panel →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} index={index} />
                <div className="absolute top-2 right-2 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <a
                    href={`https://urbanbees-product-admin.vercel.app/edit-product?id=${product.id}`}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full shadow-lg"
                    title="Edit product"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </a>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg"
                    title="Delete product"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
