'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '../../lib/supabase';
import { useSearchParams } from 'next/navigation';
import type { DatabaseProduct, DatabaseVariant } from '../../types/database';
import { compressImage } from '../../lib/image-utils';

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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  function renderDescriptionLine(line: string) {
    const urlRegex = /((?:https?:\/\/|mailto:)[^\s]+)/g;
    const parts = line.split(urlRegex);

    return parts.map((part, index) => {
      if (/^(?:https?:\/\/|mailto:)[^\s]+$/.test(part)) {
        const isMailto = part.startsWith('mailto:');
        const displayText = isMailto ? part.replace('mailto:', '').split('?')[0] : part;
        return (
          <a
            key={`url-${index}`}
            href={part}
            target={isMailto ? '_self' : '_blank'}
            rel={isMailto ? undefined : 'noreferrer'}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {displayText}
          </a>
        );
      }

      return <span key={`text-${index}`}>{part}</span>;
    });
  }

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

  // Promote image to hero (move to first position)
  function promoteToHero(index: number) {
    if (index === 0) return; // Already hero
    
    const newImages = [...existingImages];
    const [promotedImage] = newImages.splice(index, 1); // Remove from current position
    newImages.unshift(promotedImage); // Add to beginning
    setExistingImages(newImages);
    setMessage('✅ Image promoted to hero. Remember to save changes!');
    setTimeout(() => setMessage(''), 3000);
  }

  // Drag and drop handlers
  function handleDragStart(index: number) {
    if (index === 0) return; // Can't drag hero
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (index === 0) return; // Can't drop into hero position
  }

  function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex || dropIndex === 0) {
      setDraggedIndex(null);
      return;
    }

    // Reorder array atomically
    const newImages = [...existingImages];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    
    setExistingImages(newImages);
    setDraggedIndex(null);
    setMessage('✅ Images reordered. Remember to save changes!');
    setTimeout(() => setMessage(''), 3000);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
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

      // Update product via API route
      const productResponse = await fetch('/api/update-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          name,
          category,
          description,
          images: finalImages,
        }),
      });

      if (!productResponse.ok) {
        const error = await productResponse.json();
        throw new Error(error.error || 'Failed to update product');
      }

      // Update existing variants, create new ones if no id
      for (const variant of variants) {
        if (variant.id) {
          // Update existing variant
          const variantResponse = await fetch('/api/update-variant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              variantId: variant.id,
              sku: variant.sku,
              price: variant.price,
              stock_qty: variant.stock_qty,
            }),
          });

          if (!variantResponse.ok) {
            const error = await variantResponse.json();
            throw new Error(error.error || 'Failed to update variant');
          }
        } else if (product?.id && (variant.sku || variant.price || variant.stock_qty)) {
          // Create new variant if any field is filled
          const createResponse = await fetch('/api/create-variant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product_id: product.id,
              sku: variant.sku,
              price: variant.price,
              stock_qty: variant.stock_qty,
            }),
          });
          if (!createResponse.ok) {
            const error = await createResponse.json();
            throw new Error(error.error || 'Failed to create variant');
          }
        }
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
              {description.trim().length > 0 && (
                <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs font-semibold text-gray-600 mb-2">
                    Preview (links clickable)
                  </p>
                  <div className="text-sm text-gray-800 space-y-2">
                    {description.split('\n').map((line, lineIndex) => (
                      <p key={`line-${lineIndex}`} className="break-words">
                        {renderDescriptionLine(line)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Images ({existingImages.length})
                  <span className="ml-2 text-xs text-gray-500">First image is the hero image • Drag to reorder</span>
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {existingImages.map((img, idx) => (
                    <div 
                      key={idx} 
                      className={`relative group ${idx === 0 ? '' : 'cursor-move'} ${draggedIndex === idx ? 'opacity-50' : ''}`}
                      draggable={idx !== 0}
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                    >
                      {/* Hero Badge */}
                      {idx === 0 && (
                        <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded font-semibold z-10">
                          HERO
                        </div>
                      )}
                      {/* Drag Handle Indicator */}
                      {idx !== 0 && (
                        <div className="absolute top-1 left-1 bg-gray-800 text-white text-xs px-2 py-1 rounded font-semibold z-10 opacity-0 group-hover:opacity-90 transition-opacity">
                          ⋮⋮
                        </div>
                      )}
                      <img
                        src={img}
                        alt={`Image ${idx + 1}`}
                        className="w-full h-24 object-cover rounded border"
                        loading="eager"
                      />
                      {/* Promote Button (only for non-hero images) */}
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => promoteToHero(idx)}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-8 bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity z-20"
                          title="Promote to hero image"
                        >
                          ⭐ Make Hero
                        </button>
                      )}
                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => markImageForDeletion(img)}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        title="Remove image"
                      >
                        ✕ Delete
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
            <div>
              <h3 className="text-lg font-semibold mb-3">Variants ({variants.length || 1})</h3>
              <div className="space-y-3">
                {(variants.length > 0 ? variants : [{}]).map((variant, idx) => {
                  const sku = 'sku' in variant ? variant.sku : '';
                  const price = 'price' in variant ? variant.price : '';
                  const stock_qty = 'stock_qty' in variant ? variant.stock_qty : '';
                  return (
                    <div key={('id' in variant && variant.id) ? variant.id : idx} className="border border-gray-200 p-4 rounded-lg">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">SKU</label>
                          <input
                            type="text"
                            value={sku}
                            onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Price (£)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={price}
                            onChange={(e) => updateVariant(idx, 'price', parseFloat(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Stock Qty</label>
                          <input
                            type="number"
                            value={stock_qty}
                            onChange={(e) => updateVariant(idx, 'stock_qty', parseInt(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

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
