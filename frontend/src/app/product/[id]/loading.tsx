export default function Loading() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="h-10 bg-stone-200 rounded-lg w-3/4 mb-4 animate-pulse" />
      
      <div className="relative w-full h-96 bg-stone-200 rounded-lg mb-6 animate-pulse" />
      
      <div className="h-8 bg-stone-200 rounded-lg w-32 mb-4 animate-pulse" />
      
      <div className="space-y-2 mb-6">
        <div className="h-4 bg-stone-200 rounded animate-pulse" />
        <div className="h-4 bg-stone-200 rounded w-5/6 animate-pulse" />
      </div>
      
      <div className="space-y-2">
        <div className="h-4 bg-stone-200 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-stone-200 rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-stone-200 rounded w-4/5 animate-pulse" />
      </div>
    </div>
  );
}
