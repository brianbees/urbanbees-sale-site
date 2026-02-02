'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Product } from '@/data/products';
import { useCartStore } from '@/store/cart';

interface ProductDisplayProps {
  product: Product;
}

export default function ProductDisplay({ product }: ProductDisplayProps) {
  const router = useRouter();
  const { addItem, items } = useCartStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0].id);
  const [showToast, setShowToast] = useState(false);
  
  const allImages = product.images && product.images.length > 0 ? product.images : [{ src: '/images/placeholder.jpg', alt: 'No image' }];
  const selectedImage = allImages[selectedImageIndex] || allImages[0];
  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  const price = selectedVariant.price;
  const isPriceAvailable = price !== null;
  const description = product.description ?? "No description available.";

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
    
    const variantName = getVariantName();
    
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
      
      console.log('Stock check passed:', stockData);
    } catch (error) {
      console.error('Error checking stock:', error);
      // Continue anyway if stock check fails
    }
    
    console.log('Adding to cart:', { productId: product.id, productName: product.name, price });
    
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

    setShowToast(true);
  };

  const handleContinueShopping = () => {
    setShowToast(false);
  };

  const handleGoToCart = () => {
    setShowToast(false);
    router.push('/cart');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
      </div>

      {/* eBay-Style Layout: Image Left, Details Right */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Column - Images */}
        <div className="lg:w-1/2">
          {/* Main Image */}
          <div className="relative w-full h-[400px] lg:h-[500px] mb-4 bg-gray-100 rounded-lg border border-gray-300">
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt || product.name}
              fill
              className="object-contain rounded-lg"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
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
          {product.variants.length > 1 && product.options && product.options.map((option) => (
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

      {/* Toast notification with action buttons */}
      {showToast && (
        <div className="fixed top-20 right-4 bg-white border-2 border-green-500 rounded-lg shadow-xl z-50 p-4 min-w-[320px]">
          <div className="flex items-center gap-2 mb-3 text-green-600 font-semibold">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Added to cart!
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleContinueShopping}
              className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={handleGoToCart}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
            >
              Go to Cart
            </button>
          </div>
        </div>
      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Add to Cart Button */}
          <div className="mb-6">
            <button
              onClick={handleAddToCart}
              disabled={!isPriceAvailable}
              className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-colors ${
                isPriceAvailable
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isPriceAvailable ? 'Add to Cart' : 'Unavailable'}
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
            <p className="text-gray-700 leading-relaxed">{description}</p>
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

      {/* Toast notification with action buttons */}
      {showToast && (
        <div className="fixed top-20 right-4 bg-white border-2 border-green-500 rounded-lg shadow-xl z-50 p-4 min-w-[320px]">
          <div className="flex items-center gap-2 mb-3 text-green-600 font-semibold">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Added to cart!
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleContinueShopping}
              className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={handleGoToCart}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
            >
              Go to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
