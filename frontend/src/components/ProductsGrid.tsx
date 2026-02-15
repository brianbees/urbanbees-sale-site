'use client';

import { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import type { Product } from '@/data/products';

interface ProductsGridProps {
  initialProducts: Product[];
}

type ViewStyle = 'grid' | 'list' | 'compact';

export default function ProductsGrid({ initialProducts }: ProductsGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewStyle, setViewStyle] = useState<ViewStyle>('list');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(initialProducts.map(p => p.category));
    return ['all', ...Array.from(cats)];
  }, [initialProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...initialProducts];

    // Filter by search term (whole word match)
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      // Create regex with word boundaries for whole word matching
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      filtered = filtered.filter(p => 
        regex.test(p.name) || 
        (p.description && regex.test(p.description))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        filtered.sort((a, b) => {
          const priceA = a.variants[0]?.price || 0;
          const priceB = b.variants[0]?.price || 0;
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        filtered.sort((a, b) => {
          const priceA = a.variants[0]?.price || 0;
          const priceB = b.variants[0]?.price || 0;
          return priceB - priceA;
        });
        break;
      case 'newest':
        filtered.sort((a, b) => {
          // Get most recent timestamp for each product (max of created_at and updated_at)
          const getNewestTimestamp = (product: typeof a) => {
            const created = product.created_at ? new Date(product.created_at).getTime() : 0;
            const updated = product.updated_at ? new Date(product.updated_at).getTime() : 0;
            return Math.max(created, updated);
          };
          
          const timestampA = getNewestTimestamp(a);
          const timestampB = getNewestTimestamp(b);
          
          // Descending order (newest first)
          if (timestampB !== timestampA) {
            return timestampB - timestampA;
          }
          // Fallback to name for consistent ordering
          return a.name.localeCompare(b.name);
        });
        break;
    }

    return filtered;
  }, [initialProducts, searchTerm, sortBy, selectedCategory]);

  return (
    <>
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 mb-2">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filters Row - eBay Style */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
        {/* View Style Toggle */}
        <div className="flex gap-1 border border-gray-300 rounded p-1 bg-white flex-shrink-0">
          <button
            onClick={() => setViewStyle('grid')}
            className={`p-2 rounded transition-colors ${
              viewStyle === 'grid'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Grid view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewStyle('list')}
            className={`p-2 rounded transition-colors ${
              viewStyle === 'list'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="List view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => setViewStyle('compact')}
            className={`p-2 rounded transition-colors ${
              viewStyle === 'compact'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Compact view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="min-w-0 flex-1 sm:flex-shrink-0 sm:flex-1-0 px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All</option>
            {categories.filter(cat => cat !== 'all').map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        )}

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="min-w-0 flex-1 sm:flex-shrink-0 sm:flex-1-0 px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="name-asc">A-Z</option>
          <option value="name-desc">Z-A</option>
          <option value="price-asc">$ Low</option>
          <option value="price-desc">$ High</option>
          <option value="newest">Newest</option>
        </select>

        {/* Results Count */}
        <div className="flex-shrink-0 ml-auto text-xs md:text-sm text-gray-600 whitespace-nowrap">
          {filteredProducts.length} of {initialProducts.length}
        </div>
      </div>

      {/* Print Product List Link */}
      <div className="mb-3 flex items-center justify-end">
        <a
          href="/for_print?mode=all"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-600 hover:text-blue-600 underline flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
          Print full product list
        </a>
      </div>

      {/* Clear Filters Link */}
      {(searchTerm || selectedCategory !== 'all') && (
        <div className="mb-4">
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Products Grid - Dynamic Layout */}
      {filteredProducts.length > 0 ? (
        <div className={
          viewStyle === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4'
            : viewStyle === 'compact'
            ? 'space-y-2'
            : 'space-y-3'
        }>
          {filteredProducts.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              index={index}
              viewStyle={viewStyle}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 md:py-20 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-base md:text-lg px-4">No products found matching your search.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="mt-4 text-blue-600 hover:text-blue-800 underline text-sm md:text-base"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
