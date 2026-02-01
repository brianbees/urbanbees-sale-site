'use client';

import { useCartStore } from '@/store/cart';
import { useEffect, useState } from 'react';

export default function Cart() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Only render on client after hydration
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

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
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantName}`} className="flex gap-4 pb-4 border-b">
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-800 mb-1">{item.productName}</h3>
                    {item.variantName !== 'Standard' && (
                      <p className="text-sm text-zinc-500 mb-2">{item.variantName}</p>
                    )}
                    <p className="text-amber-500 font-bold">£{item.price.toFixed(2)}</p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantName, item.quantity - 1)}
                        className="w-8 h-8 rounded-md border-2 border-zinc-300 hover:border-amber-500 flex items-center justify-center transition-colors"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="text-zinc-800 font-semibold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantName, item.quantity + 1)}
                        className="w-8 h-8 rounded-md border-2 border-zinc-300 hover:border-amber-500 flex items-center justify-center transition-colors"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.productId, item.variantName)}
                    className="text-zinc-400 hover:text-red-500 transition-colors"
                    aria-label={`Remove ${item.productName} from cart`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-6 bg-stone-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-zinc-800">Total:</span>
              <span className="text-2xl font-bold text-amber-500">£{total.toFixed(2)}</span>
            </div>
            
            <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg transition-colors mb-3">
              Proceed to Checkout
            </button>
            
            <button
              onClick={clearCart}
              className="w-full text-zinc-500 hover:text-zinc-800 font-semibold py-2 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
