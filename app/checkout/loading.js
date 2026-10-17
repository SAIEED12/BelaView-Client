import {
  FormSkeleton,
  LoadingRegion,
  SkeletonBlock,
} from "@/components/loading/skeletons";

export default function Loading() {
  return (
    <LoadingRegion label="Loading checkout…">
      <main className="flex flex-1 flex-col bg-sand-soft">
        <header className="border-b border-sand-line bg-sand">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <SkeletonBlock className="h-3 w-36" />
            <SkeletonBlock className="mt-3 h-8 w-40" />
            <SkeletonBlock className="mt-3 h-4 w-80 max-w-full" />
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            <div
              aria-hidden="true"
              className="h-fit rounded-3xl border border-sand-line bg-white p-4 sm:p-5 lg:p-6"
            >
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-7 w-7 rounded-full" />
                <SkeletonBlock className="h-4 w-44" />
              </div>
              <div className="mt-4 flex flex-col gap-3">
                {[0, 1, 2].map((key) => (
                  <div
                    key={key}
                    className="flex gap-3 rounded-2xl border border-sand-line/70 bg-sand-soft/60 p-3 sm:gap-4 sm:p-4"
                  >
                    <SkeletonBlock className="h-16 w-16 shrink-0 rounded-xl sm:h-20 sm:w-20" />
                    <div className="flex-1">
                      <SkeletonBlock className="h-4 w-3/4" />
                      <SkeletonBlock className="mt-2 h-4 w-1/3" />
                      <SkeletonBlock className="mt-3 h-9 w-32 rounded-full" />
                    </div>
                    <SkeletonBlock className="h-4 w-16" />
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-2 border-t border-sand-line pt-4">
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="mt-1 h-6 w-full" />
              </div>
            </div>

            <div
              aria-hidden="true"
              className="rounded-3xl border border-sand-line bg-white p-4 sm:p-5 lg:p-6"
            >
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-7 w-7 rounded-full" />
                <SkeletonBlock className="h-4 w-36" />
              </div>
              <div className="mt-4">
                <FormSkeleton fields={5} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </LoadingRegion>
  );
}
