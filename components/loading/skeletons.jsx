export function SkeletonBlock({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-mist ${className}`}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white"
    >
      <div className="aspect-square w-full animate-pulse bg-mist" />
      <div className="flex flex-1 flex-col gap-2 p-8">
        <div className="h-5 w-3/4 animate-pulse rounded-xl bg-mist" />
        <div className="h-4 w-1/2 animate-pulse rounded-xl bg-line/70" />
        <div className="mt-2 flex items-center justify-between gap-3 pt-1">
          <div className="h-7 w-24 animate-pulse rounded-xl bg-mist" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-mist" />
        </div>
        <div className="h-10 w-full animate-pulse rounded-full bg-line/70" />
        <div className="h-10 w-full animate-pulse rounded-full bg-mist" />
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white"
    >
      <div className="aspect-4/3 w-full animate-pulse bg-mist" />
      <div className="flex flex-1 flex-col gap-2 p-6">
        <div className="h-5 w-2/3 animate-pulse rounded-xl bg-mist" />
        <div className="h-4 w-1/2 animate-pulse rounded-xl bg-line/70" />
        <div className="mt-2 h-4 w-32 animate-pulse rounded-xl bg-mist" />
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div aria-hidden="true" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {[0, 1, 2].map((key) => (
        <div
          key={key}
          className="rounded-2xl border border-line bg-white p-5"
        >
          <div className="h-10 w-10 animate-pulse rounded-full bg-mist" />
          <div className="mt-4 h-8 w-20 animate-pulse rounded-xl bg-mist" />
          <div className="mt-2 h-4 w-28 animate-pulse rounded-xl bg-line/70" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-line bg-white"
    >
      <div className="flex gap-3 border-b border-line px-5 py-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="h-4 flex-1 animate-pulse rounded-xl bg-line/70 last:max-w-24"
          />
        ))}
      </div>
      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-3 px-5 py-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className="h-4 flex-1 animate-pulse rounded-xl bg-mist last:max-w-24 last:rounded-full"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton({ fields = 5 }) {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <div className="mb-1.5 h-4 w-28 animate-pulse rounded-xl bg-line/70" />
          <div className="h-12 w-full animate-pulse rounded-xl bg-mist" />
        </div>
      ))}
      <div className="h-12 w-full animate-pulse rounded-full bg-line/70" />
    </div>
  );
}

export function LoadingRegion({ label = "Loading…", children }) {
  return (
    <div role="status" aria-label={label}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
