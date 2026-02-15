'use client';

import { useRouter } from 'next/navigation';
import { useWishlistStore } from '@/store/wishlist';
import { useCartStore } from '@/store/cart';
import Image from 'next/image';
import { useState } from 'react';

export default function WishlistPage() {
  const router = useRouter();
  const { items, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  const handleAddToCart = (item: typeof items[0]) => {
    if (item.price === null) {
      alert('This item is not available for purchase');
      return;
    }

    addItem({
      productId: item.productId,
      productName: item.productName,
      variantId: 'default',
      variant: {},
      variantName: 'Standard',
      price: item.price,
      image: item.image,
      stockQty: null,
    });

    setAddedToCart(item.productId);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  const handleEmail = () => {
    const totalPrice = items.reduce((sum, item) => sum + (item.price || 0), 0);
    
    // Build email body with product list
    const emailBody = items.map((item, idx) => {
      return `${idx + 1}. ${item.productName}${item.price ? ` - £${item.price.toFixed(2)}` : ''}${item.category ? ` (${item.category})` : ''}`;
    }).join('\n\n');
    
    const totalText = `\n\n----------\nTotal: £${totalPrice.toFixed(2)}\n\nItems: ${items.length}`;

    const fullBody = `Hello,\n\nI am interested in the following products:\n\n${emailBody}${totalText}\n\nThank you.`;
    
    const mailtoLink = `mailto:sale@urbanbees.co.uk?subject=${encodeURIComponent('I am interested in these products')}&body=${encodeURIComponent(fullBody)}`;
    
    // Use window.open for better PC browser compatibility
    window.open(mailtoLink, '_self');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
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

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Wishlist ({items.length})</h1>
          
          {items.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={handleEmail}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Email List
              </button>
              <button
                onClick={() => router.push('/for_print?mode=wishlist')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                Print List
              </button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <p className="text-gray-600 mb-4">Your wishlist is empty</p>
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:underline"
            >
              Browse products →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex gap-4 hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={item.image || '/images/placeholder.jpg'}
                    alt={item.productName}
                    fill
                    className="object-cover rounded"
                    sizes="96px"
                  />
                </div>

                {/* Details */}
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg mb-1">
                    <button
                      onClick={() => router.push(`/product/${item.productId}`)}
                      className="hover:text-blue-600 transition-colors text-left"
                    >
                      {item.productName}
                    </button>
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                  {item.price !== null && (
                    <p className="text-lg font-bold text-gray-900">£{item.price.toFixed(2)}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 justify-center">
                  {item.price !== null && (
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors whitespace-nowrap"
                    >
                      {addedToCart === item.productId ? '✓ Added' : 'Add to Cart'}
                    </button>
                  )}
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium text-sm transition-colors whitespace-nowrap"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
