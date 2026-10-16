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
        <div className="mt-6 lg:grid lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-8">
          <aside aria-hidden="true" className="hidden lg:block">
            <div className="rounded-xl border border-line bg-white p-5">
              <SkeletonBlock className="h-5 w-24" />
              <div className="mt-4 flex flex-col gap-3">
                {[0, 1, 2, 3, 4].map((key) => (
                  <SkeletonBlock key={key} className="h-5 w-full" />
                ))}
              </div>
              <SkeletonBlock className="mt-5 h-10 w-full rounded-xl" />
            </div>
          </aside>
          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-3">
              <SkeletonBlock className="h-4 w-52" />
              <SkeletonBlock className="h-10 w-36 rounded-xl" />
            </div>
            <div className="mb-4 flex gap-2">
              {[0, 1, 2].map((key) => (
                <SkeletonBlock key={key} className="h-7 w-24 rounded-full" />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((key) => (
                <ProductCardSkeleton key={key} compact />
              ))}
            </div>
          </div>
        </div>
      </main>
    </LoadingRegion>
  );
}
