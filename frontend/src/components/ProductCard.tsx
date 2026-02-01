'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/data/products';
import { useCartStore } from '@/store/cart';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  // Select first variant by default
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0].id);
  const [showToast, setShowToast] = useState(false);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  const currentPrice = selectedVariant.price;
  const isPriceAvailable = currentPrice !== null;

  // Build variant display name
  const getVariantName = () => {
    const parts: string[] = [];
    Object.entries(selectedVariant.optionValues).forEach(([, value]) => {
      parts.push(value);
    });
    return parts.length > 0 ? parts.join(' - ') : 'Standard';
  };

  const variantName = getVariantName();

  const handleAddToCart = () => {
    if (!isPriceAvailable || currentPrice === null || currentPrice === undefined) return;
    
    addItem({
      productId: product.id,
      productName: product.name,
      variant: selectedVariant.optionValues,
      variantName,
      price: currentPrice,
    });

    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      openCart();
    }, 800);
  };

  // Use image path as-is (for production with basePath, update next.config.js)
  const firstImage = product.images && product.images.length > 0 ? product.images[0] : { src: '/placeholder.svg', alt: 'No image' };
  const imageSrc = firstImage.src;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <Link href={`/product/${product.id}`} className="block" aria-label={`View ${product.name} details`}>
        <div className="relative h-48 bg-stone-100">
          <Image
            src={imageSrc}
            alt={firstImage.alt}
            fill
            priority={index !== undefined && index < 8}
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>

        <div className="p-2 md:p-4">
          <h3 className="text-sm md:text-lg font-bold text-zinc-800 mb-1.5">{product.name}</h3>
          {product.description && (
            <p className="text-zinc-600 text-xs mb-3 hidden md:block line-clamp-2">{product.description}</p>
          )}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-zinc-500 uppercase hidden md:inline">{product.category}</span>
            {selectedVariant.stockQty !== null && (
              <span className="text-xs text-amber-600">
                {selectedVariant.stockQty} in stock
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="p-2 md:p-4 pt-0">
        <div className="space-y-3">
          {/* Render variant selectors if product has multiple variants */}
          {product.variants.length > 1 && product.options && product.options.map((option) => (
            <div key={option.id}>
              <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                {option.label}:
              </label>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  // Find variant that matches this option value
                  const matchingVariant = product.variants.find(
                    (v) => v.optionValues[option.id] === value
                  );
                  if (!matchingVariant) return null;

                  const isSelected = selectedVariantId === matchingVariant.id;
                  
                  return (
                    <button
                      key={value}
                      onClick={() => setSelectedVariantId(matchingVariant.id)}
                      className={`py-1.5 px-3 rounded-lg border-2 font-medium transition-all text-xs ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 text-amber-600'
                          : 'border-stone-200 hover:border-amber-300 text-zinc-600'
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Price and Add to Cart */}
          <div className="pt-3 border-t flex items-center justify-between">
            <div>
              {isPriceAvailable ? (
                <span className="text-lg md:text-2xl font-bold text-amber-500">£{currentPrice.toFixed(2)}</span>
              ) : (
                <span className="text-sm md:text-base font-semibold text-zinc-600">Contact for Price</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!isPriceAvailable}
              aria-label={`Add ${product.name} to cart`}
              className={`font-bold py-1.5 px-2 md:py-2 md:px-4 rounded-lg transition-colors flex items-center gap-1 md:gap-2 text-xs md:text-sm ${
                isPriceAvailable
                  ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 md:w-5 md:h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              <span>
                <span className="hidden md:inline">{isPriceAvailable ? 'Add to Cart' : 'Unavailable'}</span>
                <span className="md:hidden">{isPriceAvailable ? 'Add' : 'N/A'}</span>
              </span>
            </button>
          </div>
        </div>

        {/* Toast notification */}
        {showToast && (
          <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
            ✓ Added to cart!
          </div>
        )}
      </div>
    </div>
  );
}
