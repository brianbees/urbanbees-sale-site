'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Upload images to Supabase Storage
    const uploadedUrls: string[] = [];

    for (const file of images) {
      const filePath = `products/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const url =
        supabase.storage.from('product-images').getPublicUrl(filePath).data
          .publicUrl;

      uploadedUrls.push(url);
    }

    // Insert product into database
    const { data, error } = await supabase.from('products').insert([
      {
        name,
        category,
        description,
        images: uploadedUrls,
      },
    ]);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setLoading(false);

    // Redirect to Add Variant page
    router.push('/add-variant');
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Add Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          placeholder="Product name"
          className="w-full p-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Category"
          className="w-full p-2 border rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />

        <textarea
          placeholder="Description"
          className="w-full p-2 border rounded"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={(e) => setImages(Array.from(e.target.files || []))}
          className="w-full"
        />

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded" > {loading ? 'Saving…' : 'Save Product'} </button> </form> </div>);
}
