'use client';

import Link from 'next/link';
import { useWishlistStore } from '@/store/wishlist';
import { useEffect, useState } from 'react';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Subscribe to wishlist after mount to avoid hydration mismatch
    const unsubscribe = useWishlistStore.subscribe((state) => {
      setWishlistCount(state.items.length);
    });
    // Set initial count
    const initialCount = useWishlistStore.getState().items.length;
    setWishlistCount(initialCount);
    
    return unsubscribe;
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-amber-600">🐝</span>
            <span className="text-xl font-bold text-gray-900">Urban Bees</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            {/* About Link */}
            <Link
              href="/about"
              className="text-gray-700 font-medium hover:text-amber-600 transition-colors hidden sm:inline"
            >
              About
            </Link>

            {/* Navigation Icons */}
            <div className="flex items-center gap-2">
            {/* Wishlist Icon */}
            <Link
              href="/wishlist"
              className="relative flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700"
                fill="none"
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
              <span className="text-gray-700 font-medium hidden sm:inline">Wishlist</span>
              
              {/* Badge */}
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
