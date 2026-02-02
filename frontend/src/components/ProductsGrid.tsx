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

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.description?.toLowerCase().includes(term)
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
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-md p-3 md:p-4 mb-6 md:mb-8">
        <div className="flex flex-col gap-3">
          {/* Search Input */}
          <div className="w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="w-full">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low-High)</option>
              <option value="price-desc">Price (High-Low)</option>
            </select>
          </div>
        </div>

        {/* Category Filter Buttons - Horizontal Scroll on Mobile */}
        {categories.length > 1 && (
          <div className="mt-3 -mx-3 md:mx-0">
            <div className="flex gap-2 overflow-x-auto px-3 md:px-0 pb-2 md:pb-0 md:flex-wrap scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex-shrink-0 px-3 py-1.5 text-xs md:text-sm rounded-lg font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-3 text-xs md:text-sm text-gray-600 flex flex-wrap items-center gap-2">
          <span>Showing {filteredProducts.length} of {initialProducts.length} products</span>
          {(searchTerm || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
