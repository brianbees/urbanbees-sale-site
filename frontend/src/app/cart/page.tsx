'use client';

import { useCartStore } from '@/store/cart';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import PayPalButton from '@/components/PayPalButton';

interface StockWarning {
  variantId: string;
  currentStock: number | null;
  requestedQty: number;
}

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [stockWarnings, setStockWarnings] = useState<StockWarning[]>([]);

  useEffect(() => {
    setMounted(true);
    
    // Clean up any old cart items without variantId
    items.forEach(item => {
      if (!item.variantId) {
        console.warn('Removing invalid cart item:', item);
        removeItem(item.productId, item.variantName);
      }
    });
  }, []);

  // Check stock for all items
  useEffect(() => {
    if (items.length === 0) return;

    const checkAllStock = async () => {
      const warnings: StockWarning[] = [];
      
      for (const item of items) {
        // Skip if no variantId
        if (!item.variantId) {
          console.warn('Item missing variantId:', item);
          continue;
        }
        
        try {
          const response = await fetch('/api/check-stock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ variantId: item.variantId }),
          });
          
          const stockData = await response.json();
          
          if (stockData.stockQty !== null && stockData.stockQty < item.quantity) {
            warnings.push({
              variantId: item.variantId,
              currentStock: stockData.stockQty,
              requestedQty: item.quantity,
            });
          }
        } catch (error) {
          console.error('Error checking stock for item:', item.productName, error);
        }
      }
      
      setStockWarnings(warnings);
    };

    checkAllStock();
  }, [items]);

  if (!mounted) return null;

  const total = getTotalPrice();
  const hasStockIssues = stockWarnings.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some products to get started</p>
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const warning = stockWarnings.find(w => w.variantId === item.variantId);
                
                return (
                  <div key={`${item.productId}-${item.variantName}`} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex gap-6">
                      {/* Product Image */}
                      {item.image ? (
                        <div className="relative w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg border border-gray-200">
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            className="object-cover rounded-lg"
                            sizes="128px"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 flex-shrink-0 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No image</span>
                        </div>
                      )}
                      
                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.productName}</h3>
                        {item.variantName !== 'Standard' && (
                          <p className="text-sm text-gray-600 mb-2">{item.variantName}</p>
                        )}
                        <p className="text-xl font-bold text-gray-900 mb-3">£{item.price.toFixed(2)}</p>
                        
                        {/* Stock Warning */}
                        {warning && (
                          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            {warning.currentStock === 0 
                              ? '⚠️ This item is currently out of stock' 
                              : `⚠️ Only ${warning.currentStock} available (you have ${warning.requestedQty} in cart)`}
                          </div>
                        )}
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.productId, item.variantName, item.quantity - 1)}
                              className="w-9 h-9 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center transition-colors"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="text-gray-900 font-semibold w-12 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.variantName, item.quantity + 1)}
                              className="w-9 h-9 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center transition-colors"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.productId, item.variantName)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>£{total.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>£{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {hasStockIssues && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    ⚠️ Some items have stock issues. Please adjust quantities before checkout.
                  </div>
                )}
                
                {/* PayPal Button */}
                <PayPalButton 
                  items={items.map(item => ({
                    variantId: item.variantId,
                    productId: item.productId,
                    name: `${item.productName}${item.variantName !== 'Standard' ? ` - ${item.variantName}` : ''}`,
                    variantName: item.variantName,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                  }))}
                  disabled={hasStockIssues}
                />
                
                <Link
                  href="/"
                  className="block w-full text-center py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  ← Continue Shopping
                </Link>
                
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear your cart?')) {
                      clearCart();
                    }
                  }}
                  className="w-full mt-3 text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
