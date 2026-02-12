'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Product } from '@/data/products';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const { addItem, items } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const router = useRouter();

  // Select first variant by default
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0].id);
  const [showToast, setShowToast] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const inWishlist = mounted ? isInWishlist(product.id) : false;

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

  const handleAddToCart = async () => {
    if (!isPriceAvailable || currentPrice === null || currentPrice === undefined) return;
    
    // Check real-time stock before adding
    try {
      const response = await fetch('/api/check-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId: selectedVariantId }),
      });
      
      const stockData = await response.json();
      
      // Check current quantity in cart
      const existingItem = items.find(
        (item) => item.productId === product.id && item.variantName === variantName
      );
      const currentQtyInCart = existingItem ? existingItem.quantity : 0;
      const availableStock = stockData.stockQty;
      
      if (!stockData.available || availableStock === 0) {
        alert('Sorry, this item is currently out of stock.');
        return;
      }
      
      if (availableStock !== null && currentQtyInCart >= availableStock) {
        alert(`You already have the maximum available quantity (${availableStock}) in your cart.`);
        return;
      }
      
      if (availableStock !== null && currentQtyInCart + 1 > availableStock) {
        alert(`Only ${availableStock} available. You already have ${currentQtyInCart} in your cart.`);
        return;
      }
    } catch (error) {
      console.error('Error checking stock:', error);
      // Continue anyway if stock check fails (don't block legitimate purchases)
    }
    
    addItem({
      productId: product.id,
      productName: product.name,
      variantId: selectedVariantId,
      variant: selectedVariant.optionValues,
      variantName,
      price: currentPrice,
      image: imageSrc,
      stockQty: selectedVariant.stockQty,
    });

    setShowToast(true);
  };

  const handleContinueShopping = () => {
    setShowToast(false);
  };

  const handleGoToCart = () => {
    setShowToast(false);
    router.push('/cart');
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      const firstImage = product.images && product.images.length > 0 ? product.images[0] : { src: '/images/placeholder.jpg', alt: 'No image' };
      addToWishlist({
        productId: product.id,
        productName: product.name,
        price: currentPrice,
        image: firstImage.src,
        category: product.category,
      });
    }
  };

  // Use image path as-is (for production with basePath, update next.config.js)
  const firstImage = product.images && product.images.length > 0 ? product.images[0] : { src: '/images/placeholder.jpg', alt: 'No image' };
  const imageSrc = firstImage.src;

  return (
    <div className="bg-white border border-gray-300 rounded hover:shadow-lg transition-shadow relative">
      {/* Wishlist Heart Button - Top Right */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transition-colors ${inWishlist ? 'fill-red-500 text-red-500' : 'fill-none text-gray-400 hover:text-red-500'}`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      {/* eBay-style horizontal layout: Image left, details right */}
      <div className="flex flex-row">
        {/* Left side - Image */}
        <Link href={`/product/${product.id}`} className="flex-shrink-0" aria-label={`View ${product.name} details`}>
          <div className="relative w-32 h-36 md:w-40 md:h-44 bg-stone-100">
            <Image
              src={imageSrc}
              alt={firstImage.alt}
              fill
              priority={index !== undefined && index < 8}
              className="object-cover"
              sizes="(max-width: 768px) 128px, 160px"
            />
          </div>
        </Link>

        {/* Right side - Product details */}
        <div className="flex-1 p-3 md:p-4 flex flex-col">
          <Link href={`/product/${product.id}`} className="block mb-2" aria-label={`View ${product.name} details`}>
            <h3 className="text-sm md:text-lg font-bold text-gray-900 hover:text-blue-600 mb-1">{product.name}</h3>
            {product.description && (
              <p className="text-gray-600 text-xs md:text-sm mb-2 line-clamp-2">{product.description}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500">{product.category}</span>
              {selectedVariant.stockQty !== null && (
                <span className="text-xs text-green-600 font-medium">
                  {selectedVariant.stockQty} in stock
                </span>
              )}
            </div>
          </Link>

          {/* Render variant selectors if product has multiple variants */}
          {product.variants.length > 1 && product.options && product.options.map((option) => (
            <div key={option.id} className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {option.label}:
              </label>
              <div className="flex flex-wrap gap-1.5">
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
                      className={`py-1 px-2 rounded border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Price and Buttons - bottom aligned */}
          <div className="mt-auto pt-2">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div>
                {isPriceAvailable ? (
                  <span className="text-lg md:text-xl font-bold text-gray-900">£{currentPrice.toFixed(2)}</span>
                ) : (
                  <span className="text-sm font-semibold text-gray-600">Contact for Price</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={!isPriceAvailable}
                  aria-label={`Add ${product.name} to cart`}
                  className={`font-semibold py-1.5 px-3 md:py-2 md:px-4 rounded transition-colors text-xs md:text-sm ${
                    isPriceAvailable
                      ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isPriceAvailable ? 'Add to cart' : 'Unavailable'}
                </button>
                
                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistToggle}
                  className="flex items-center justify-center gap-1 py-1.5 px-3 md:py-2 md:px-4 rounded border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors text-xs md:text-sm font-medium text-gray-700"
                  aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-colors ${inWishlist ? 'fill-red-500 text-red-500' : 'fill-none text-gray-600'}`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>{inWishlist ? 'In Wishlist' : 'Wishlist'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Toast notification with action buttons */}
          {showToast && (
            <div className="fixed top-20 right-4 bg-white border-2 border-green-500 rounded-lg shadow-xl z-50 p-4 min-w-[300px]">
              <div className="flex items-center gap-2 mb-3 text-green-600 font-semibold">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Added to cart!
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleContinueShopping}
                  className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium text-sm transition-colors"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={handleGoToCart}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors"
                >
                  Go to Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
