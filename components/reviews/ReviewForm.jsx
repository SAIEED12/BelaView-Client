"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Label, TextArea, TextField } from "@heroui/react";
import toast from "react-hot-toast";
import { submitReview } from "@/lib/actions/reviews";
import { StarPicker } from "./StarPicker";

const RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

const inputClassName =
  "w-full rounded-xl border border-[#E5E5E5] bg-white px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#8A8A8A] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

const labelClassName = "text-sm font-medium text-[#1A1A1A]";

export function ReviewForm({
  productId,
  productName = "this product",
  initialReview = null,
  signedIn = false,
  onSaved,
}) {
  const [rating, setRating] = useState(Number(initialReview?.rating ?? 0));
  const [comment, setComment] = useState(initialReview?.comment ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const existing = Boolean(initialReview);

  if (!signedIn) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-sand-line bg-white p-6 text-center">
        <p className="text-sm font-semibold text-ink">
          Share your experience
        </p>
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-smoke">
          Sign in to rate {productName} and help other customers choose with
          confidence.
        </p>
        <Link
          href={`/login?redirect=${encodeURIComponent(`/products/${productId}`)}`}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-xs font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:bg-brand-dark"
        >
          Sign in to review
        </Link>
      </div>
    );
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!rating) {
      setError("Please choose a star rating.");
      return;
    }

    startTransition(async () => {
      const result = await submitReview({ productId, rating, comment });
      if (!result?.ok) {
        setError(result?.error || "Couldn't submit your review. Please try again.");
        return;
      }
      toast.success(
        existing ? "Your review was updated!" : "Thanks for your review!",
      );
      onSaved?.(result);
    });
  };

  return (
    <div className="rounded-2xl border border-sand-line bg-white p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-ink">
        {existing ? "Edit your review" : "Write a review"}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-smoke">
        {existing
          ? "You already rated this product — update your rating or comment any time."
          : "Your review appears right away and helps other customers."}
      </p>

      {initialReview?.hidden ? (
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
          A moderator has hidden this review from the storefront. Editing it
          won&apos;t make it public again.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className={labelClassName}>Your rating</span>
          <div className="flex flex-wrap items-center gap-3">
            <StarPicker
              value={rating}
              onChange={(next) => {
                setRating(next);
                if (error) setError("");
              }}
              disabled={isPending}
            />
            <span className="text-xs font-medium text-smoke">
              {rating ? RATING_LABELS[rating] : "Tap a star"}
            </span>
          </div>
        </div>

        <TextField
          className="flex w-full flex-col gap-1.5"
          value={comment}
          onChange={(value) => setComment(value)}
          isDisabled={isPending}
        >
          <Label className={labelClassName}>
            Your review{" "}
            <span className="font-normal text-fog">(optional)</span>
          </Label>
          <TextArea
            placeholder="What did you like? How did it fit your space?"
            rows={4}
            maxLength={2000}
            className={`${inputClassName} min-h-28 resize-y`}
          />
        </TextField>

        {error ? (
          <p className="text-sm text-brand" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[11px] text-fog">{comment.length}/2000</span>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex cursor-pointer items-center justify-center rounded-full bg-brand px-5 py-2.5 text-xs font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Saving…" : existing ? "Update review" : "Post review"}
          </button>
        </div>
      </form>
    </div>
  );
}
