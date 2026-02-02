'use client';

import { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import type { Product } from '@/data/products';

interface ProductsGridProps {
  initialProducts: Product[];
}

export default function ProductsGrid({ initialProducts }: ProductsGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [selectedCategory, setSelectedCategory] = useState('all');

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
    }

    return filtered;
  }, [initialProducts, searchTerm, sortBy, selectedCategory]);

  return (
    <>
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filters Row - eBay Style */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {/* Category Filter */}
        {categories.length > 1 && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-shrink-0 px-3 py-2 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
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
          className="flex-shrink-0 px-3 py-2 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="name-asc">Sort: Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-asc">Price (Low-High)</option>
          <option value="price-desc">Price (High-Low)</option>
        </select>

        {/* Results Count */}
        <div className="flex-shrink-0 ml-auto text-xs md:text-sm text-gray-600 whitespace-nowrap">
          {filteredProducts.length} of {initialProducts.length}
        </div>
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

      {/* Products Grid - eBay style vertical list */}
      {filteredProducts.length > 0 ? (
        <div className="space-y-3">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
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
