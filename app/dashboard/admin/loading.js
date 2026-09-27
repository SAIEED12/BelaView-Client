import {
  LoadingRegion,
  SkeletonBlock,
  TableSkeleton,
} from "@/components/loading/skeletons";

export default function Loading() {
  return (
    <LoadingRegion label="Loading dashboard…">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SkeletonBlock className="h-8 w-52" />
          <SkeletonBlock className="h-10 w-36 rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <div
              key={key}
              aria-hidden="true"
              className="rounded-2xl border border-line bg-white p-5"
            >
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="mt-3 h-8 w-20" />
            </div>
          ))}
        </div>
        <TableSkeleton rows={8} cols={5} />
      </div>
    </LoadingRegion>
  );
}
