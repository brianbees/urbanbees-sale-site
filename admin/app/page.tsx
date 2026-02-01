import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full p-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Urban Bees Product Admin
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            href="/add-product" 
            className="block p-8 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">📦</div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-900">Add Product</h2>
              <p className="text-gray-600">Create a new product with images</p>
            </div>
          </Link>

          <Link 
            href="/edit-product" 
            className="block p-8 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border-2 border-transparent hover:border-purple-500"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">✏️</div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-900">Edit Product</h2>
              <p className="text-gray-600">Update existing products and variants</p>
            </div>
          </Link>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Connected to Supabase</p>
        </div>
      </div>
    </div>
  );
}
