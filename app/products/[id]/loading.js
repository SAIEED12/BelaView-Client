import {
  LoadingRegion,
  ProductCardSkeleton,
  SkeletonBlock,
} from "@/components/loading/skeletons";

export default function Loading() {
  return (
    <LoadingRegion label="Loading product…">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <SkeletonBlock className="h-4 w-52" />

        {/* Gallery + info */}
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
          <div>
            <SkeletonBlock className="aspect-square w-full rounded-2xl" />
            <div className="mt-3 flex gap-3">
              {[0, 1, 2].map((key) => (
                <SkeletonBlock key={key} className="h-20 w-20 rounded-2xl" />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <SkeletonBlock className="h-6 w-28 rounded-full" />
            <SkeletonBlock className="h-11 w-3/4" />
            <SkeletonBlock className="h-10 w-44" />
            <SkeletonBlock className="h-12 w-full rounded-full" />
            <SkeletonBlock className="h-12 w-full rounded-full" />
            <div className="grid grid-cols-3 gap-3 border-t border-line pt-6">
              {[0, 1, 2].map((key) => (
                <div key={key} className="flex flex-col items-center gap-2">
                  <SkeletonBlock className="h-10 w-10 rounded-full" />
                  <SkeletonBlock className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description panel */}
        <SkeletonBlock className="mt-10 h-48 w-full rounded-3xl" />

        {/* Policy cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((key) => (
            <SkeletonBlock key={key} className="h-32 rounded-2xl" />
          ))}
        </div>

        {/* Related products */}
        <div className="mt-10 grid grid-cols-2 gap-7 sm:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <ProductCardSkeleton key={key} compact />
          ))}
        </div>
      </main>
    </LoadingRegion>
  );
}
