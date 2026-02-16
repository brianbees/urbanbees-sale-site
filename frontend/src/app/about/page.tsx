import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Urban Bees',
  description: 'Learn more about Urban Bees',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            About Urban Bees
          </h1>
          
          <div className="prose prose-lg text-gray-600">
            <p>Content coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
