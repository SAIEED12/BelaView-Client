import {
  LoadingRegion,
  SkeletonBlock,
  StatsSkeleton,
  TableSkeleton,
} from "@/components/loading/skeletons";

export default function Loading() {
  return (
    <LoadingRegion label="Loading account…">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="mt-2 h-8 w-64" />
          </div>
          <div className="flex gap-2">
            <SkeletonBlock className="h-9 w-28 rounded-full" />
            <SkeletonBlock className="h-9 w-32 rounded-full" />
          </div>
        </div>
        <StatsSkeleton />
        <TableSkeleton rows={4} cols={4} />
      </div>
    </LoadingRegion>
  );
}
