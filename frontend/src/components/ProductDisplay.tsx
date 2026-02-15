'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Product } from '@/data/products';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { useToast } from '@/components/ToastProvider';

interface ProductDisplayProps {
  product: Product;
}

export default function ProductDisplay({ product }: ProductDisplayProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { addItem, items } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0].id);
  const [showLightbox, setShowLightbox] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const inWishlist = mounted ? isInWishlist(product.id) : false;
  
  const allImages = product.images && product.images.length > 0 ? product.images : [{ src: '/images/placeholder.jpg', alt: 'No image' }];
  const selectedImage = allImages[selectedImageIndex] || allImages[0];
  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  const price = selectedVariant.price;
  const isPriceAvailable = price !== null;
  const description = product.description ?? "No description available.";

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
          >
            {displayText}
          </a>
        );
      }
      return <span key={`text-${index}`}>{part}</span>;
    });
  };

  const getVariantName = () => {
    const parts: string[] = [];
    Object.entries(selectedVariant.optionValues).forEach(([, value]) => {
      parts.push(value);
    });
    return parts.length > 0 ? parts.join(' - ') : 'Standard';
  };

  const handleAddToCart = async () => {
    if (!isPriceAvailable || price === null) {
      console.log('Cannot add to cart: price not available', { isPriceAvailable, price });
      return;
    }

    // Prevent duplicate clicks
    if (isAddingToCart) {
      return;
    }
    
    setIsAddingToCart(true);
    
    const variantName = getVariantName();
    
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
      
      console.log('Stock check passed:', stockData);
      
      // Add to cart
      addItem({
        productId: product.id,
        productName: product.name,
        variantId: selectedVariantId,
        variant: selectedVariant.optionValues,
        variantName: getVariantName(),
        price: price,
        image: selectedImage.src,
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
      addToWishlist({
        productId: product.id,
        productName: product.name,
        price: price,
        image: selectedImage.src,
        category: product.category,
      });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Back Button */}
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

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 transition-colors ${inWishlist ? 'fill-red-500 text-red-500' : 'fill-none text-gray-600 hover:text-red-500'}`}
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
          <span className="text-sm font-medium text-gray-700">
            {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
          </span>
        </button>
      </div>

      {/* eBay-Style Layout: Image Left, Details Right */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Column - Images */}
        <div className="lg:w-1/2">
          {/* Main Image */}
          <div 
            className="relative w-full h-[400px] lg:h-[500px] mb-4 bg-gray-100 rounded-lg border border-gray-300 cursor-zoom-in"
            onClick={() => setShowLightbox(true)}
          >
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt || product.name}
              fill
              className="object-contain rounded-lg"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              unoptimized
            />
          </div>

          {/* Image Gallery Thumbnails */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-6 gap-2">
              {allImages.map((image: { src: string; alt: string }, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative h-16 border-2 rounded-lg overflow-hidden transition-all ${
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
                    sizes="100px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Product Details */}
        <div className="lg:w-1/2">
          <h1 className="text-2xl lg:text-3xl font-bold mb-3 text-gray-900">{product.name}</h1>

          {/* Price */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            {isPriceAvailable ? (
              <p className="text-3xl font-bold text-gray-900">£{price.toFixed(2)}</p>
            ) : (
              <p className="text-2xl text-gray-500">Price: Contact for details</p>
            )}
          </div>

          {/* Variant Selectors */}
          {product.variants.length > 1 && (
            <>
              {/* Option-based selectors (for products with defined options) */}
              {product.options && product.options.map((option) => (
                <div key={option.id} className="mb-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    {option.label}:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const matchingVariant = product.variants.find(
                        (v) => v.optionValues[option.id] === value
                      );
                      if (!matchingVariant) return null;

                      const isSelected = selectedVariantId === matchingVariant.id;
                      
                      return (
                        <button
                          key={value}
                          onClick={() => setSelectedVariantId(matchingVariant.id)}
                          className={`py-2 px-4 rounded border-2 font-medium transition-all ${
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
          
          {/* Simple variant selector (for products without options but multiple variants) */}
          {(!product.options || product.options.length === 0) && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Select Option:
              </label>
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 focus:border-blue-500 focus:outline-none"
              >
                {product.variants.map((variant, index) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.sku ? `${variant.sku} - £${variant.price?.toFixed(2)}` : `Option ${index + 1} - £${variant.price?.toFixed(2)}`}
                  </option>
                ))}
              </select>
            </div>
          )}
          </>
          )}

          {/* Add to Cart Button */}
          <div className="mb-6">
            <button
              onClick={handleAddToCart}
              disabled={!isPriceAvailable || isAddingToCart}
              className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2 ${
                isPriceAvailable && !isAddingToCart
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
            >
              {isAddingToCart ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding to Cart...
                </>
              ) : isPriceAvailable ? (
                'Add to Cart'
              ) : (
                'Make an offer'
              )}
            </button>
          </div>

          {/* Stock Info */}
          {selectedVariant.stockQty !== null && (
            <p className="text-sm text-green-600 font-medium mb-4">
              {selectedVariant.stockQty} in stock
            </p>
          )}

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-900">Description</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              {description.split('\n').map((line, lineIndex) => (
                <p key={`line-${lineIndex}`}>
                  {renderDescriptionLine(line)}
                </p>
              ))}
            </div>
          </div>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2 text-gray-900">Features</h2>
              <ul className="list-disc pl-5 text-gray-700 space-y-1.5">
                {product.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Category Badge */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <span className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
              Category: {product.category}
            </span>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
          <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt || product.name}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
          <p className="text-white text-sm mt-4">Click again to close this zoomed image</p>
        </div>
      )}
    </div>
  );
}
