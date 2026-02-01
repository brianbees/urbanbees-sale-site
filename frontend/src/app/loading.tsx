export default function Loading() {
  return (
    <main className="min-h-screen bg-stone-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="h-12 bg-stone-200 rounded-lg w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-stone-200 rounded-lg w-96 mx-auto animate-pulse" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-stone-200 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-stone-200 rounded animate-pulse" />
                <div className="h-4 bg-stone-200 rounded w-3/4 animate-pulse" />
                <div className="h-8 bg-stone-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
