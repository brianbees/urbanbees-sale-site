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
            <div key={product.id} className="relative group">
              <ProductCard product={product} index={index} />
              <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                <a
                  href={`https://urbanbees-product-admin.vercel.app/edit-product?id=${product.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full shadow-lg"
                  title="Edit product"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
