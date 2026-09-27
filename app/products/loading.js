import {
  LoadingRegion,
  ProductCardSkeleton,
  SkeletonBlock,
} from "@/components/loading/skeletons";

export default function Loading() {
  return (
    <LoadingRegion label="Loading products…">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SkeletonBlock className="h-9 w-56" />
        <div className="mt-6 flex flex-col gap-3">
          <SkeletonBlock className="h-12 w-full rounded-full" />
          <div className="flex gap-2">
            <SkeletonBlock className="h-10 w-28 rounded-full" />
            <SkeletonBlock className="h-10 w-28 rounded-full" />
            <SkeletonBlock className="hidden h-10 w-28 rounded-full sm:block" />
          </div>
        </div>
        <div className="mt-6 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
          <aside aria-hidden="true" className="hidden lg:block">
            <div className="rounded-2xl border border-line bg-white p-5">
              <SkeletonBlock className="h-5 w-24" />
              <div className="mt-4 flex flex-col gap-3">
                {[0, 1, 2, 3, 4].map((key) => (
                  <SkeletonBlock key={key} className="h-5 w-full" />
                ))}
              </div>
              <SkeletonBlock className="mt-5 h-10 w-full rounded-full" />
            </div>
          </aside>
          <div className="min-w-0">
            <SkeletonBlock className="mb-4 h-4 w-52" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((key) => (
                <ProductCardSkeleton key={key} />
              ))}
            </div>
            <div className="mt-8 flex justify-center gap-2">
              <SkeletonBlock className="h-10 w-24 rounded-full" />
              <SkeletonBlock className="h-10 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </main>
    </LoadingRegion>
  );
}
