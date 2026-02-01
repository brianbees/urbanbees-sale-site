import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-zinc-800 mb-4">Product Not Found</h1>
        <p className="text-lg text-zinc-600 mb-8">
          Sorry, we couldn&apos;t find the product you&apos;re looking for.
        </p>
        <Link 
          href="/"
          className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Back to Products
        </Link>
      </div>
    </div>
  );
}
