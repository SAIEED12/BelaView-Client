import {
  LoadingRegion,
  ProductCardSkeleton,
  SkeletonBlock,
} from "@/components/loading/skeletons";

export default function Loading() {
  return (
    <LoadingRegion label="Loading homepage…">
      <div className="flex min-h-screen flex-col bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <SkeletonBlock className="mt-6 h-[320px] rounded-2xl md:h-[420px]" />
          <div className="grid grid-cols-2 gap-4 py-10 sm:grid-cols-4">
            {[0, 1, 2, 3].map((key) => (
              <SkeletonBlock key={key} className="h-28 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 pb-10 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((key) => (
              <ProductCardSkeleton key={key} />
            ))}
          </div>
          <div className="grid items-center gap-10 pb-16 lg:grid-cols-2">
            <SkeletonBlock className="aspect-[4/3] rounded-2xl" />
            <div className="flex flex-col gap-3">
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-9 w-3/4" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-5/6" />
              <SkeletonBlock className="mt-2 h-11 w-52 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </LoadingRegion>
  );
}
