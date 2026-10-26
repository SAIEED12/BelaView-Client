"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getProductReviews } from "@/lib/actions/reviews";
import { ReviewForm } from "./ReviewForm";
import { ReviewItem } from "./ReviewItem";
import { ReviewSummary } from "./ReviewSummary";

export function ProductReviews({
  productId,
  productName = "this product",
  summary: initialSummary,
  initialReviews = [],
  initialPage = 1,
  initialTotalPages = 1,
  signedIn = false,
  myReview = null,
}) {
  const router = useRouter();
  const [summary, setSummary] = useState(initialSummary);
  const [reviews, setReviews] = useState(
    Array.isArray(initialReviews) ? initialReviews : [],
  );
  const [myReviewState, setMyReviewState] = useState(myReview);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoadingMore, startLoadingMore] = useTransition();

  const total = Number(summary?.total ?? 0);

  const handleSaved = (result) => {
    if (result?.summary) setSummary(result.summary);
    if (result?.review) {
      const saved = result.review;
      setMyReviewState(saved);
      // A review hidden by an admin stays hidden when edited; don't inject it
      // into the public list.
      if (!saved.hidden) {
        setReviews((prev) => [
          saved,
          ...prev.filter((entry) => entry._id !== saved._id),
        ]);
      }
    }
    // Refresh the server-rendered header (average next to the price).
    router.refresh();
  };

  const handleLoadMore = () => {
    startLoadingMore(async () => {
      const next = await getProductReviews(productId, { page: page + 1 });
      setReviews((prev) => {
        const seen = new Set(prev.map((entry) => entry._id));
        return [...prev, ...next.reviews.filter((entry) => !seen.has(entry._id))];
      });
      setPage(next.page);
      setTotalPages(next.totalPages);
      setSummary({
        average: next.average,
        total: next.total,
        breakdown: next.breakdown,
      });
    });
  };

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"
    >
      <div className="rounded-3xl border border-sand-line bg-sand-soft p-5 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-brand uppercase">
              Reviews
            </p>
            <h2
              id="reviews-heading"
              className="mt-1 font-serif text-2xl font-semibold text-ink"
            >
              What customers say
            </h2>
          </div>
          <span className="rounded-full border border-sand-line bg-white px-3 py-1.5 text-xs font-medium text-smoke">
            {total > 0
              ? `${total} review${total === 1 ? "" : "s"}`
              : "Be the first to review"}
          </span>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:items-start">
          <ReviewSummary summary={summary} />
          <ReviewForm
            productId={productId}
            productName={productName}
            initialReview={myReviewState}
            signedIn={signedIn}
            onSaved={handleSaved}
          />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-sand-line bg-white px-6 py-10 text-center">
              <p className="text-sm font-semibold text-ink">
                No reviews yet
              </p>
              <p className="mt-1 text-xs text-smoke">
                {signedIn
                  ? "Be the first to rate this product."
                  : "Sign in to be the first to review this product."}
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <ReviewItem key={review._id} review={review} />
            ))
          )}

          {page < totalPages ? (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="mx-auto mt-2 inline-flex cursor-pointer items-center justify-center rounded-full border border-sand-line bg-white px-5 py-2.5 text-xs font-semibold tracking-[0.12em] text-ink uppercase transition-colors hover:border-brand hover:text-brand disabled:cursor-wait disabled:opacity-60"
            >
              {isLoadingMore ? "Loading…" : "Show more reviews"}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
