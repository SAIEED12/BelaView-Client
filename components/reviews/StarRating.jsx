import { Star } from "lucide-react";

/**
 * Read-only star row with fractional fill (e.g. 4.3 renders 4 full stars and
 * a 30%-filled fifth). Pure component, safe in server and client trees.
 */
export function StarRating({ value = 0, size = 14, className = "", label }) {
  const rating = Math.max(0, Math.min(5, Number(value) || 0));

  return (
    <span
      role="img"
      aria-label={label ?? `Rated ${rating.toFixed(1)} out of 5`}
      className={`inline-flex items-center gap-0.5 ${className}`}
    >
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = Math.max(0, Math.min(1, rating - index));
        return (
          <span
            key={index}
            className="relative inline-flex shrink-0"
            style={{ width: size, height: size }}
            aria-hidden="true"
          >
            <Star
              size={size}
              strokeWidth={1.5}
              className="text-sand-line"
            />
            <span
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star
                size={size}
                strokeWidth={1.5}
                className="fill-brand text-brand"
              />
            </span>
          </span>
        );
      })}
    </span>
  );
}
