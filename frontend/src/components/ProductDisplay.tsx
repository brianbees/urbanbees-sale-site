'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Product } from '@/data/products';

interface ProductDisplayProps {
  product: Product;
}

export default function ProductDisplay({ product }: ProductDisplayProps) {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const allImages = product.images && product.images.length > 0 ? product.images : [{ src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E', alt: 'No image' }];
  const selectedImage = allImages[selectedImageIndex] || allImages[0];
  const price = product.variants?.[0]?.price;
  const description = product.description ?? "No description available.";

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Back Button and Edit Button */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        <a
          href={`https://urbanbees-product-admin.vercel.app/edit-product?id=${product.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Edit
        </a>
      </div>

      <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

      {/* Main Image */}
      <div className="relative w-full h-96 mb-4 bg-gray-100 rounded-lg">
        <Image
          src={selectedImage.src}
          alt={selectedImage.alt || product.name}
          fill
          className="object-contain rounded-lg"
          sizes="(max-width: 768px) 100vw, 800px"
          priority
        />
      </div>

      {/* Image Gallery - Show all thumbnails */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2 mb-6">
          {allImages.map((image: { src: string; alt: string }, index: number) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative h-24 border-2 rounded-lg overflow-hidden transition-all ${
                index === selectedImageIndex
                  ? 'border-blue-500 ring-2 ring-blue-300'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt || `${product.name} - Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="200px"
              />
            </button>
          ))}
        </div>
      )}

      {price !== null ? (
        <p className="text-xl text-gray-700 mb-4">£{price}</p>
      ) : (
        <p className="text-xl text-gray-500 mb-4">Price: Contact for details</p>
      )}

      <p className="text-gray-600 mb-6">{description}</p>

      {product.features && product.features.length > 0 && (
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          {product.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
