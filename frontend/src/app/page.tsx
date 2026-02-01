// src\app\page.tsx
// 

import products from '@/data/products';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-800 mb-4">
            Urban Bees Sale
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Premium beekeeping supplies and local honey from our urban hives. 
            Support local beekeepers and help our pollinators thrive.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
