'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import type { DatabaseProduct, DatabaseVariant } from '@/types/database';

// Compress image before upload
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 1920;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.85
        );
      };
    };
  });
}

function EditProductForm() {
  const searchParams = useSearchParams();
  const urlProductId = searchParams.get('id');
  
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [product, setProduct] = useState<DatabaseProduct | null>(null);
  const [variants, setVariants] = useState<DatabaseVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  // Load all products on mount
  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading products:', error);
        setMessage('❌ Failed to load products');
        return;
      }

      setProducts(data || []);
      
      // If URL has product ID, auto-select it
      if (urlProductId && data) {
        setSelectedProductId(urlProductId);
        loadProduct(urlProductId);
      }
    }

    loadProducts();
  }, [urlProductId]);

  // Load selected product data
  async function loadProduct(productId: string) {
    if (!productId) return;

    setLoading(true);
    setMessage('');

    try {
      // Load product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      // Load variants
      const { data: variantsData, error: variantsError } = await supabase
        .from('variants')
        .select('*')
        .eq('product_id', productId);

      if (variantsError) throw variantsError;

      setProduct(productData);
      setVariants(variantsData || []);
      setName(productData.name);
      setCategory(productData.category);
      setDescription(productData.description || '');
      setExistingImages(productData.images || []);
      setNewImages([]);
      setImagesToDelete([]);
    } catch (error) {
      console.error('Error loading product:', error);
      setMessage('❌ Failed to load product');
    } finally {
      setLoading(false);
    }
  }

  // Handle product selection
  function handleProductSelect(productId: string) {
    setSelectedProductId(productId);
    loadProduct(productId);
  }

  // Handle image deletion
  function markImageForDeletion(imageUrl: string) {
    setImagesToDelete([...imagesToDelete, imageUrl]);
    setExistingImages(existingImages.filter(img => img !== imageUrl));
  }

  // Handle new image selection
  async function handleNewImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const compressed = await Promise.all(files.map(compressImage));
    setNewImages([...newImages, ...compressed]);
  }

  // Remove new image before upload
  function removeNewImage(index: number) {
    setNewImages(newImages.filter((_, i) => i !== index));
  }

  // Handle variant field update
  function updateVariant(index: number, field: keyof DatabaseVariant, value: any) {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  }

  // Save changes
  async function handleSave() {
    if (!product) return;

    setSaving(true);
    setMessage('Saving changes...');

    try {
      // Create slug from product name for filenames
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'product';

      // Upload new images to Supabase Storage
      const newImageUrls: string[] = [];
      
      // Start numbering from existing image count + 1
      const startIndex = existingImages.length;
      
      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i];
        const fileExt = file.name.split('.').pop();
        const timestamp = Date.now();
        const fileName = `${slug}-${startIndex + i + 1}-${timestamp}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        newImageUrls.push(publicUrl);
      }

      // Combine existing (not deleted) + new images
      const finalImages = [...existingImages, ...newImageUrls];

      // Update product
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name,
          category,
          description,
          images: finalImages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id);

      if (updateError) throw updateError;

      // Update variants
      for (const variant of variants) {
        const { error: variantError } = await supabase
          .from('variants')
          .update({
            sku: variant.sku,
            price: variant.price,
            stock_qty: variant.stock_qty,
            updated_at: new Date().toISOString(),
          })
          .eq('id', variant.id);

        if (variantError) throw variantError;
      }

      setMessage('✅ Product updated successfully! Redirecting to preview...');
      
      // Redirect to preview page
      setTimeout(() => {
        window.location.href = 'https://frontend-six-kappa-30.vercel.app/preview';
      }, 1000);
    } catch (error) {
      console.error('Error saving product:', error);
      setMessage(`❌ Failed to save: ${error}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold">Edit Product</h1>
            <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">v2.4.0</span>
          </div>
          <a
            href="https://frontend-six-kappa-30.vercel.app/preview"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
          >
            🔍 View Preview
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          </a>
        </div>

        {/* Product Selection */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Product to Edit
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => handleProductSelect(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Choose a product --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading product...</p>
          </div>
        )}

        {/* Edit Form */}
        {product && !loading && (
          <div className="bg-white p-6 rounded-lg shadow space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="e.g., Assembled Cedar Beehive"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="">Select category</option>
                <option value="Beekeeping Equipment">Beekeeping Equipment</option>
                <option value="Hive Components">Hive Components</option>
                <option value="Protective Gear">Protective Gear</option>
                <option value="Tools">Tools</option>
                <option value="Honey Processing">Honey Processing</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Product description..."
              />
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Images ({existingImages.length})
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {existingImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt={`Image ${idx + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => markImageForDeletion(img)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add New Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleNewImages}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              {newImages.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  {newImages.length} new image(s) selected
                  <div className="mt-2 space-y-1">
                    {newImages.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span>{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Variants */}
            {variants.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Variants ({variants.length})</h3>
                <div className="space-y-3">
                  {variants.map((variant, idx) => (
                    <div key={variant.id} className="border border-gray-200 p-4 rounded-lg">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">SKU</label>
                          <input
                            type="text"
                            value={variant.sku || ''}
                            onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Price (£)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={variant.price || ''}
                            onChange={(e) => updateVariant(idx, 'price', parseFloat(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Stock Qty</label>
                          <input
                            type="number"
                            value={variant.stock_qty || ''}
                            onChange={(e) => updateVariant(idx, 'stock_qty', parseInt(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800' : message.includes('❌') ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
                {message}
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold"
            >
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EditProductPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <EditProductForm />
    </Suspense>
  );
}
