import { Star } from "lucide-react";
import { StarRating } from "./StarRating";

/** Average score plus a 5→1 star breakdown, shown beside the review form. */
export function ReviewSummary({ summary, className = "" }) {
  const total = Math.max(0, Number(summary?.total ?? 0));
  const average = Math.max(0, Number(summary?.average ?? 0));
  const breakdown = summary?.breakdown ?? {};

  return (
    <div className={`flex flex-col gap-5 ${className}`}>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-sand-line bg-white px-6 py-5 text-center">
        <span className="font-serif text-4xl leading-none text-ink">
          {total > 0 ? average.toFixed(1) : "—"}
        </span>
        <StarRating value={average} size={16} className="mt-2" />
        <span className="mt-1.5 text-xs text-smoke">
          {total > 0
            ? `${total} review${total === 1 ? "" : "s"}`
            : "No reviews yet"}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = Math.max(0, Number(breakdown?.[star] ?? 0));
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={star} className="flex items-center gap-3 text-xs">
              <span className="flex w-9 shrink-0 items-center gap-1 text-smoke">
                {star}
                <Star
                  size={11}
                  strokeWidth={1.5}
                  className="fill-brand text-brand"
                  aria-hidden="true"
                />
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-sand-line/60">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="w-7 shrink-0 text-right tabular-nums text-fog">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
