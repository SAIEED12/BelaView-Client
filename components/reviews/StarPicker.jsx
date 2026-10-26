"use client";

import { useState } from "react";
import { Star } from "lucide-react";

/** Interactive 1–5 star selector used by the review form. */
export function StarPicker({ value = 0, onChange, size = 30, disabled = false }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || Number(value) || 0;

  return (
    <div
      role="radiogroup"
      aria-label="Star rating"
      className="inline-flex items-center gap-1"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= active;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={Number(value) === star}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            disabled={disabled}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(0)}
            onClick={() => onChange?.(star)}
            className="cursor-pointer rounded-md p-0.5 outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Star
              size={size}
              strokeWidth={1.5}
              className={
                filled ? "fill-brand text-brand" : "text-sand-line"
              }
            />
          </button>
        );
      })}
    </div>
  );
}
