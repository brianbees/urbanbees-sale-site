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
  const [importing, setImporting] = useState(false);
  const [deployMessage, setDeployMessage] = useState('');
  const [importMessage, setImportMessage] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Fetch products and their variants
        const { data: dbProducts, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('name');

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

  async function handleImport() {
    setImporting(true);
    setImportMessage('Checking for products to import...');

    try {
      const response = await fetch('/api/import-existing', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        setImportMessage(`✅ ${result.message}`);
        // Refresh products list after 2 seconds to show message
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setImportMessage(`❌ Import failed: ${result.error}`);
        setImporting(false);
      }
    } catch (error) {
      setImportMessage(`❌ Import failed: ${error}`);
      setImporting(false);
    }
  }

  async function handleDelete(productId: string, productName: string) {
    if (!confirm(`Are you sure you want to delete "${productName}"?\n\nThis will also delete all variants and cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch('/api/delete-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const result = await response.json();

      if (response.ok) {
        // Remove from local state
        setProducts(products.filter(p => p.id !== productId));
        alert(`✅ Deleted: ${productName}`);
      } else {
        alert(`❌ Delete failed: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Delete failed: ${error}`);
    }
  }

  async function handleDeploy() {
    setDeploying(true);
    setDeployMessage('Exporting products to production...');

    try {
      const response = await fetch('/api/deploy-products', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        setDeployMessage('✅ Successfully deployed! The main site will update in ~30 seconds.');
      } else {
        setDeployMessage(`❌ Deploy failed: ${result.error}`);
      }
    } catch (error) {
      setDeployMessage(`❌ Deploy failed: ${error}`);
    } finally {
      setDeploying(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Deploy Banner */}
      <div className="bg-yellow-100 border-b border-yellow-300 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-yellow-900">
                🔍 Preview Mode - Database Products
              </h2>
              <p className="text-sm text-yellow-700">
                This page shows products from your Supabase database. When satisfied, deploy to production.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
              <a
                href="https://urbanbees-product-admin.vercel.app/add-product"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold text-center flex items-center justify-center gap-2"
              >
                ➕ <span className="hidden sm:inline">Add Product</span><span className="sm:hidden">Add</span>
              </a>
              <div className="flex gap-2">
                <button
                  onClick={handleImport}
                  disabled={importing || products.length >= 69}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold text-center"
                >
                  {importing ? 'Importing...' : products.length >= 69 ? '✓ Imported' : '📥 Import'}
                </button>
                <button
                  onClick={handleDeploy}
                  disabled={deploying}
                  className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold text-center"
                >
                  {deploying ? 'Deploying...' : '🚀 Deploy'}
                </button>
              </div>
            </div>
          </div>
          {importMessage && (
            <div className="mt-2 p-2 bg-white rounded text-sm">
              {importMessage}
            </div>
          )}
          {deployMessage && (
            <div className="mt-2 p-2 bg-white rounded text-sm">
              {deployMessage}
            </div>
          )}
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
                    target="_blank"
                    rel="noopener noreferrer"
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
