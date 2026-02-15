'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Product } from '@/data/products';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { useToast } from '@/components/ToastProvider';

interface ProductCardProps {
  product: Product;
  index?: number;
  viewStyle?: 'grid' | 'list' | 'compact';
}

export default function ProductCard({ product, index, viewStyle = 'list' }: ProductCardProps) {
  const { addItem, items } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { showToast } = useToast();
  const router = useRouter();

  // Select first variant by default
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0].id);
  const [mounted, setMounted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

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

  // Render URLs and mailto links as clickable
  const renderDescriptionLine = (line: string) => {
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
            rel={isMailto ? undefined : 'noopener noreferrer'}
            className="text-blue-600 hover:text-blue-800 underline"
            onClick={(e) => e.stopPropagation()} // Prevent card link click
          >
            {displayText}
          </a>
        );
      }
      return <span key={`text-${index}`}>{part}</span>;
    });
  };

  const handleAddToCart = async () => {
    if (!isPriceAvailable || currentPrice === null || currentPrice === undefined) return;
    
    // Prevent duplicate clicks
    if (isAddingToCart) {
      return;
    }
    
    setIsAddingToCart(true);
    
    // Check real-time stock before adding
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('/api/check-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId: selectedVariantId }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Stock check failed');
      }
      
      const stockData = await response.json();
      
      // Check current quantity in cart
      const existingItem = items.find(
        (item) => item.productId === product.id && item.variantName === variantName
      );
      const currentQtyInCart = existingItem ? existingItem.quantity : 0;
      const availableStock = stockData.stockQty;
      
      if (!stockData.available || availableStock === 0) {
        showToast('error', 'Sorry, this item is currently out of stock.');
        setIsAddingToCart(false);
        return;
      }
      
      if (availableStock !== null && currentQtyInCart >= availableStock) {
        showToast('warning', `You already have the maximum available quantity (${availableStock}) in your cart.`);
        setIsAddingToCart(false);
        return;
      }
      
      if (availableStock !== null && currentQtyInCart + 1 > availableStock) {
        showToast('warning', `Only ${availableStock} available. You already have ${currentQtyInCart} in your cart.`);
        setIsAddingToCart(false);
        return;
      }
      
      // Add to cart
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

      showToast('success', 'Added to cart!');
      
    } catch (error) {
      console.error('Error checking stock:', error);
      
      // Check if it was a timeout
      if (error instanceof Error && error.name === 'AbortError') {
        showToast('error', 'Request timed out. Please check your connection and try again.');
      } else {
        showToast('error', 'Failed to add item to cart. Please try again.');
      }
    } finally {
      setIsAddingToCart(false);
    }
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

  // Grid View - Vertical card layout
  if (viewStyle === 'grid') {
    return (
      <div className="bg-white border border-gray-300 rounded hover:shadow-lg transition-shadow relative flex flex-col">
        {/* Wishlist Heart Button - Top Right */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
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

        {/* Image */}
        <Link href={`/product/${product.id}`} aria-label={`View ${product.name} details`}>
          <div className="relative w-full h-48 bg-stone-100">
            <Image
              src={imageSrc}
              alt={firstImage.alt}
              fill
              priority={index !== undefined && index < 8}
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        </Link>

        {/* Details */}
        <div className="p-3 flex flex-col flex-1">
          <Link href={`/product/${product.id}`} className="block mb-2">
            <h3 className="text-sm font-bold text-gray-900 hover:text-blue-600 mb-1 line-clamp-2">{product.name}</h3>
            <span className="text-xs text-gray-500">{product.category}</span>
          </Link>

          <div className="mt-auto">
            <div className="mb-2">
              {isPriceAvailable ? (
                <span className="text-lg font-bold text-gray-900">£{currentPrice.toFixed(2)}</span>
              ) : (
                <span className="text-xs font-semibold text-gray-600">Contact for Price</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!isPriceAvailable || isAddingToCart}
              className={`w-full font-semibold py-2 px-3 rounded transition-colors text-xs flex items-center justify-center gap-1 ${
                isPriceAvailable && !isAddingToCart
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
            >
              {isAddingToCart ? 'Adding...' : isPriceAvailable ? 'Add to cart' : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Compact View - Minimal horizontal layout
  if (viewStyle === 'compact') {
    return (
      <div className="bg-white border border-gray-300 rounded hover:shadow-md transition-shadow relative">
        <div className="flex flex-row items-center">
          <Link href={`/product/${product.id}`} className="flex-shrink-0">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-stone-100">
              <Image
                src={imageSrc}
                alt={firstImage.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 64px, 80px"
              />
            </div>
          </Link>

          <div className="flex-1 px-1.5 sm:px-2 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 min-w-0 overflow-hidden">
            <Link href={`/product/${product.id}`} className="flex-1 min-w-0 overflow-hidden">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 hover:text-blue-600 truncate overflow-hidden">{product.name}</h3>
              <span className="text-[10px] sm:text-xs text-gray-500 truncate block overflow-hidden">{product.category}</span>
            </Link>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 overflow-hidden">
              {isPriceAvailable ? (
                <span className="text-sm sm:text-base font-bold text-gray-900 whitespace-nowrap">£{currentPrice.toFixed(2)}</span>
              ) : (
                <span className="text-[10px] sm:text-xs text-gray-600 whitespace-nowrap">Contact</span>
              )}
              <button
                onClick={handleAddToCart}
                disabled={!isPriceAvailable || isAddingToCart}
                className={`py-1 px-2 sm:py-1.5 sm:px-3 rounded text-[10px] sm:text-xs font-semibold transition-colors whitespace-nowrap flex-shrink-0 ${
                  isPriceAvailable && !isAddingToCart
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-400 text-white cursor-not-allowed'
                }`}
              >
                {isAddingToCart ? '+' : isPriceAvailable ? 'Add' : 'N/A'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View - Default horizontal layout (existing)
  return (
    <div className="bg-white border border-gray-300 rounded hover:shadow-lg transition-shadow relative">
      {/* Wishlist Heart Button - Top Right */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-2 right-2 z-10 p-2.5 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 transition-colors ${inWishlist ? 'fill-red-500 text-red-500' : 'fill-none text-gray-400 hover:text-red-500'}`}
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
              <p className="text-gray-600 text-xs md:text-sm mb-2 line-clamp-2">
                {product.description.split('\n').slice(0, 2).map((line, idx) => (
                  <span key={`desc-${idx}`} className="block">
                    {renderDescriptionLine(line)}
                  </span>
                ))}
              </p>
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
                      className={`py-2 px-3 rounded border text-xs md:text-sm font-medium transition-all ${
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
                  disabled={!isPriceAvailable || isAddingToCart}
                  aria-label={`Add ${product.name} to cart`}
                  className={`font-semibold py-1.5 px-3 md:py-2 md:px-4 rounded transition-colors text-xs md:text-sm flex items-center gap-1 ${
                    isPriceAvailable && !isAddingToCart
                      ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                      : 'bg-gray-400 text-white cursor-not-allowed'
                  }`}
                >
                  {isAddingToCart ? (
                    <>
                      <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden md:inline">Adding...</span>
                    </>
                  ) : isPriceAvailable ? (
                    'Add to cart'
                  ) : (
                    'Unavailable'
                  )}
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
        </div>
      </div>
    </div>
  );
}
