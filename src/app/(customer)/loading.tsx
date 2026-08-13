import { Skeleton } from '@/components/ui/skeleton';

export default function HomeLoading() {
  return (
    <div className="space-y-0">
      {/* Hero Section skeleton */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70 min-h-[420px]">
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl space-y-6">
            <Skeleton className="h-6 w-48 bg-white/20" />
            <div className="space-y-3">
              <Skeleton className="h-12 w-96 bg-white/20" />
              <Skeleton className="h-12 w-72 bg-white/20" />
            </div>
            <Skeleton className="h-6 w-[420px] bg-white/20" />
            <div className="flex flex-wrap gap-3 pt-2">
              <Skeleton className="h-11 w-40 bg-white/20 rounded-md" />
              <Skeleton className="h-11 w-36 bg-white/20 rounded-md" />
            </div>
          </div>
        </div>
      </section>

      {/* Free Delivery Banner skeleton */}
      <section className="bg-primary/5 border-y border-primary/10">
        <div className="container mx-auto px-4 py-3">
          <Skeleton className="h-5 w-64 mx-auto" />
        </div>
      </section>

      {/* Popular Meals skeleton */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-7 w-40 mb-2" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
      </section>

      {/* Categories skeleton */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <Skeleton className="h-7 w-52 mx-auto mb-2" />
            <Skeleton className="h-4 w-40 mx-auto" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border p-6 text-center">
                <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
                <Skeleton className="h-5 w-24 mx-auto mb-2" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
