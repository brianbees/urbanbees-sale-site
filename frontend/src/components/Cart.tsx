'use client';

import { useCartStore } from '@/store/cart';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface StockWarning {
  variantId: string;
  currentStock: number | null;
  requestedQty: number;
}

export default function Cart() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [stockWarnings, setStockWarnings] = useState<StockWarning[]>([]);

  // Only render on client after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check stock for all items in cart
  useEffect(() => {
    if (!isOpen || items.length === 0) return;

    const checkAllStock = async () => {
      const warnings: StockWarning[] = [];
      
      for (const item of items) {
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
  }, [isOpen, items]);

  if (!mounted || !isOpen) return null;

  const total = getTotalPrice();

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeCart}
        aria-hidden="true"
      />
      
      {/* Cart Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-zinc-800">Shopping Cart</h2>
          <button
            onClick={closeCart}
            className="text-zinc-500 hover:text-zinc-800 transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-500 text-lg mb-4">Your cart is empty</p>
              <button
                onClick={closeCart}
                className="text-amber-500 hover:text-amber-600 font-semibold"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const warning = stockWarnings.find(w => w.variantId === item.variantId);
                
                return (
                  <div key={`${item.productId}-${item.variantName}`} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    {/* Product Image */}
                    {item.image && (
                      <div className="relative w-16 h-16 flex-shrink-0 bg-white rounded border border-gray-200">
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          className="object-cover rounded"
                          sizes="64px"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 mb-0.5 truncate">{item.productName}</h3>
                      {item.variantName !== 'Standard' && (
                        <p className="text-xs text-gray-500 mb-1">{item.variantName}</p>
                      )}
                      <p className="text-gray-900 font-bold text-sm">£{item.price.toFixed(2)}</p>
                      
                      {/* Stock Warning */}
                      {warning && (
                        <div className="mt-1 text-xs text-red-600 font-medium">
                          {warning.currentStock === 0 
                            ? '⚠️ Out of stock' 
                            : `⚠️ Only ${warning.currentStock} available`}
                        </div>
                      )}
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantName, item.quantity - 1)}
                          className="w-7 h-7 rounded border border-gray-300 hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center transition-colors text-sm"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="text-gray-800 font-medium w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantName, item.quantity + 1)}
                          className="w-7 h-7 rounded border border-gray-300 hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center transition-colors text-sm"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.productId, item.variantName)}
                      className="text-gray-400 hover:text-red-500 transition-colors self-start"
                      aria-label={`Remove ${item.productName} from cart`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-6 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-800">Total:</span>
              <span className="text-2xl font-bold text-gray-900">£{total.toFixed(2)}</span>
            </div>
            
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors mb-3">
              Proceed to Checkout
            </button>
            
            <div className="flex items-center justify-between">
              <button
                onClick={closeCart}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                ← Continue Shopping
              </button>
              <button
                onClick={clearCart}
                className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
