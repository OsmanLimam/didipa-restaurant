import { Skeleton } from '@/components/ui/skeleton';

export default function MenuLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header skeleton */}
      <div className="mb-6">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Search & Filters skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-9 w-32 shrink-0" />
      </div>

      {/* Category Tabs skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-full shrink-0" />
        ))}
      </div>

      {/* Menu Grid skeleton - 4-column grid matching the actual layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border overflow-hidden">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
