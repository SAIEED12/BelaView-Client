import {
  FormSkeleton,
  LoadingRegion,
  SkeletonBlock,
} from "@/components/loading/skeletons";

export default function Loading() {
  return (
    <LoadingRegion label="Loading checkout…">
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <SkeletonBlock className="h-9 w-44" />
        <div className="mt-6 grid grid-cols-1 gap-6 sm:mt-8 lg:grid-cols-2 lg:gap-8">
          <div
            aria-hidden="true"
            className="h-fit rounded-2xl border border-line bg-white p-4 sm:p-5 lg:p-6"
          >
            <SkeletonBlock className="h-4 w-48" />
            <div className="mt-4 flex flex-col gap-4">
              {[0, 1, 2].map((key) => (
                <div key={key} className="flex gap-3">
                  <SkeletonBlock className="h-16 w-16 shrink-0 rounded-xl sm:h-20 sm:w-20" />
                  <div className="flex-1">
                    <SkeletonBlock className="h-4 w-3/4" />
                    <SkeletonBlock className="mt-2 h-4 w-1/3" />
                    <SkeletonBlock className="mt-2 h-8 w-28 rounded-full" />
                  </div>
                  <SkeletonBlock className="h-4 w-16" />
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2 border-t border-line pt-4">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-6 w-full" />
            </div>
          </div>
          <div
            aria-hidden="true"
            className="rounded-2xl border border-line bg-white p-4 sm:p-5 lg:p-6"
          >
            <SkeletonBlock className="h-4 w-40" />
            <div className="mt-4">
              <FormSkeleton fields={5} />
            </div>
          </div>
        </div>
      </main>
    </LoadingRegion>
  );
}
