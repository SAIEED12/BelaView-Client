import {
  CategoryCardSkeleton,
  LoadingRegion,
  SkeletonBlock,
} from "@/components/loading/skeletons";

export default function Loading() {
  return (
    <LoadingRegion label="Loading categories…">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SkeletonBlock className="h-9 w-48" />
        <SkeletonBlock className="mt-2 mb-8 h-4 w-32" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((key) => (
            <CategoryCardSkeleton key={key} />
          ))}
        </div>
      </main>
    </LoadingRegion>
  );
}
