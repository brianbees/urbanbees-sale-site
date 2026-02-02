'use client';

import { useState } from 'react';

export default function DeployPage() {
  const [deploying, setDeploying] = useState(false);
  const [message, setMessage] = useState('');

  async function handleDeploy() {
    setDeploying(true);
    setMessage('🔄 Clearing frontend cache...');

    try {
      const response = await fetch('https://frontend-six-kappa-30.vercel.app/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to revalidate');
      }

      const result = await response.json();
      setMessage('✅ Frontend cache cleared! All product changes are now live.');
      console.log('Revalidation result:', result);
    } catch (error: any) {
      console.error('Deployment error:', error);
      setMessage(`❌ Failed to deploy: ${error.message}`);
    } finally {
      setDeploying(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6">Deploy to Frontend</h1>
          
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>What this does:</strong> Clears the frontend cache so all product changes 
              (new products, edits, images) become visible immediately on the live site.
            </p>
          </div>

          <button
            onClick={handleDeploy}
            disabled={deploying}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
          >
            {deploying ? '🔄 Deploying...' : '🚀 Deploy Changes to Frontend'}
          </button>

          {message && (
            <div className={`mt-6 p-4 rounded-lg ${
              message.includes('✅') 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : message.includes('❌')
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}>
              <p className="text-sm font-medium">{message}</p>
              {message.includes('✅') && (
                <div className="mt-4 space-y-2">
                  <a 
                    href="https://frontend-six-kappa-30.vercel.app" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    → View Live Site
                  </a>
                  <a 
                    href="https://frontend-six-kappa-30.vercel.app/preview" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    → View Preview Page
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 pt-6 border-t">
            <h2 className="text-lg font-semibold mb-3">Quick Links</h2>
            <div className="space-y-2">
              <a href="/" className="block text-blue-600 hover:text-blue-800">← Back to Home</a>
              <a href="/add-product" className="block text-blue-600 hover:text-blue-800">Add Product</a>
              <a href="/edit-product" className="block text-blue-600 hover:text-blue-800">Edit Product</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
