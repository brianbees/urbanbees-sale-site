'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h2 className="text-3xl font-bold text-zinc-800 mb-4">Something went wrong!</h2>
        <p className="text-zinc-600 mb-8">
          We encountered an error loading this page. Please try again.
        </p>
        <button
          onClick={reset}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
