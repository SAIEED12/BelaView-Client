import { StarRating } from "./StarRating";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  // Fixed locale + UTC keeps SSR and hydration output identical.
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

const wasEdited = (review) => {
  if (!review?.createdAt || !review?.updatedAt) return false;
  const created = new Date(review.createdAt).getTime();
  const updated = new Date(review.updatedAt).getTime();
  return Number.isFinite(created) && Number.isFinite(updated) && updated - created > 60_000;
};

export function ReviewItem({ review }) {
  const name = review?.userName?.trim() || "Customer";
  const initial = name.charAt(0).toUpperCase() || "C";

  return (
    <article className="rounded-2xl border border-sand-line bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand"
        >
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-ink">{name}</p>
            <time
              dateTime={review?.createdAt ?? undefined}
              className="text-xs text-fog"
            >
              {formatDate(review?.createdAt)}
            </time>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <StarRating value={review?.rating} size={13} />
            {wasEdited(review) ? (
              <span className="text-[11px] text-fog">· edited</span>
            ) : null}
          </div>
          {review?.comment ? (
            <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-smoke">
              {review.comment}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
