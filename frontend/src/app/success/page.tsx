'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderID = searchParams.get('orderID');

  useEffect(() => {
    // Clear cart after successful payment
    if (typeof window !== 'undefined') {
      localStorage.removeItem('urban-bees-cart');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order. Your payment has been processed successfully.
        </p>

        {/* Order ID */}
        {orderID && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Order ID</p>
            <p className="text-sm font-mono text-gray-900 break-all">{orderID}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-blue-800">
            <strong>What happens next?</strong>
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
            <li>You'll receive a confirmation email from PayPal</li>
            <li>Your order will be processed shortly</li>
            <li>Stock has been reserved for your items</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="block w-full text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
