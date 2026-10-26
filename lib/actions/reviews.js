"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { authFetch, authFetchJson } from "@/lib/auth-fetch";
import { toUserMessage } from "@/lib/error-message";

const SERVER_URL = process.env.SERVER_URL;
const ADMIN_REVIEWS_PATH = "/dashboard/admin/reviews";
const DEFAULT_LIMIT = 10;

const emptyBreakdown = () => ({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeReview = (review) => {
  if (!review || typeof review !== "object") return null;
  return {
    _id: String(review._id ?? review.id ?? ""),
    productId: String(review.productId ?? ""),
    rating: Number(review.rating ?? 0),
    comment: typeof review.comment === "string" ? review.comment : "",
    userName:
      typeof review.userName === "string" && review.userName.trim()
        ? review.userName.trim()
        : "Customer",
    hidden: Boolean(review.hidden),
    createdAt: review.createdAt ?? null,
    updatedAt: review.updatedAt ?? null,
    productName: typeof review.productName === "string" ? review.productName : "",
    productSlug:
      typeof review.productSlug === "string" ? review.productSlug : "",
    userEmail: typeof review.userEmail === "string" ? review.userEmail : "",
  };
};

const normalizeSummary = (summary) => {
  const source = summary && typeof summary === "object" ? summary : {};
  const breakdown = emptyBreakdown();
  for (const star of [1, 2, 3, 4, 5]) {
    breakdown[star] = Number(source?.breakdown?.[star] ?? 0) || 0;
  }
  return {
    average: Number(source.average ?? 0) || 0,
    total: Number(source.total ?? 0) || 0,
    breakdown,
  };
};

const emptyReviewsResult = (limit = DEFAULT_LIMIT) => ({
  reviews: [],
  ...normalizeSummary(null),
  page: 1,
  limit,
  totalPages: 1,
});

const revalidateProduct = (productId) => {
  const id = String(productId ?? "").trim();
  if (!id) return;
  // Product pages now live at /products/[slug]; the numeric path only exists
  // while an old link is being redirected.
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/products");
  // Homepage cards cache /products for 60s; drop it so the new average shows.
  revalidatePath("/");
};

/** Public review list for a product (first page by default). */
export const getProductReviews = async (productId, options = {}) => {
  const id = String(productId ?? "").trim();
  const limit = toPositiveInt(options?.limit, DEFAULT_LIMIT);
  if (!id) return emptyReviewsResult(limit);

  try {
    const page = toPositiveInt(options?.page, 1);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(Math.min(limit, 50)),
    });
    const response = await fetch(
      `${SERVER_URL}/products/${encodeURIComponent(id)}/reviews?${params.toString()}`,
      { cache: "no-store" },
    );
    if (!response.ok) return emptyReviewsResult(limit);
    const data = await response.json();
    const reviews = Array.isArray(data?.reviews)
      ? data.reviews.map(normalizeReview).filter(Boolean)
      : [];
    return {
      reviews,
      ...normalizeSummary(data),
      page: toPositiveInt(data?.page, page),
      limit: toPositiveInt(data?.limit, limit),
      totalPages: toPositiveInt(data?.totalPages, 1),
    };
  } catch {
    return emptyReviewsResult(limit);
  }
};

/**
 * Auth state for the review form: whether the visitor is signed in and, if
 * so, the review they already wrote for this product (to edit in place).
 */
export const getReviewerState = async (productId) => {
  const id = String(productId ?? "").trim();
  if (!id) return { signedIn: false, review: null };

  let session = null;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    session = null;
  }
  if (!session?.user) return { signedIn: false, review: null };

  try {
    const data = await authFetchJson(
      `${SERVER_URL}/reviews/mine?productId=${encodeURIComponent(id)}`,
      { cache: "no-store" },
      "Failed to fetch your review",
    );
    return {
      signedIn: true,
      review: data?.review ? normalizeReview(data.review) : null,
    };
  } catch {
    return { signedIn: true, review: null };
  }
};

/**
 * Create or update the signed-in customer's review.
 * Reviews are auto-published; admins can hide them later.
 */
export const submitReview = async ({ productId, rating, comment }) => {
  try {
    const id = String(productId ?? "").trim();
    if (!id) throw new Error("Invalid product.");

    const value = Number(rating);
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new Error("Please choose a star rating from 1 to 5.");
    }

    const commentText = typeof comment === "string" ? comment.trim() : "";
    if (commentText.length > 2000) {
      throw new Error("Review must be 2000 characters or fewer.");
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      throw new Error("Please sign in to submit a review.");
    }

    const response = await authFetch(`${SERVER_URL}/reviews`, {
      method: "POST",
      body: JSON.stringify({ productId: id, rating: value, comment: commentText }),
    });

    let result = null;
    try {
      result = await response.json();
    } catch {
      result = null;
    }
    if (!response.ok) {
      throw new Error(result?.error || result?.msg || "Failed to submit review");
    }

    revalidateProduct(id);

    return {
      ok: true,
      review: normalizeReview(result?.review),
      summary: normalizeSummary(result?.summary),
    };
  } catch (err) {
    console.error("submitReview failed:", err);
    return {
      ok: false,
      error: toUserMessage(err, "Couldn't submit your review. Please try again."),
    };
  }
};

/** Admin: paginated review list including hidden entries. */
export const getAdminReviews = async (options = {}) => {
  const page = toPositiveInt(options?.page, 1);
  const limit = Math.min(toPositiveInt(options?.limit, 20), 100);
  const filter = ["all", "visible", "hidden"].includes(options?.filter)
    ? options.filter
    : "all";
  const q = typeof options?.q === "string" ? options.q.trim() : "";

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    filter,
  });
  if (q) params.set("q", q);

  const data = await authFetchJson(
    `${SERVER_URL}/admin/reviews?${params.toString()}`,
    { cache: "no-store" },
    "Failed to fetch reviews",
  );

  const reviews = Array.isArray(data?.reviews)
    ? data.reviews.map(normalizeReview).filter(Boolean)
    : [];

  return {
    reviews,
    total: Number(data?.total ?? reviews.length) || 0,
    hiddenCount: Number(data?.hiddenCount ?? 0) || 0,
    page: toPositiveInt(data?.page, page),
    limit: toPositiveInt(data?.limit, limit),
    totalPages: toPositiveInt(data?.totalPages, 1),
  };
};

/** Admin: hide or restore a review. */
export const setReviewHidden = async (reviewId, hidden) => {
  try {
    const id = String(reviewId ?? "").trim();
    if (!id) throw new Error("Invalid review.");

    const response = await authFetch(`${SERVER_URL}/admin/reviews/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ hidden: Boolean(hidden) }),
    });

    let result = null;
    try {
      result = await response.json();
    } catch {
      result = null;
    }
    if (!response.ok) {
      throw new Error(result?.error || result?.msg || "Failed to update review");
    }

    const review = normalizeReview(result);
    revalidatePath(ADMIN_REVIEWS_PATH);
    revalidateProduct(review?.productId);

    return { ok: true, review };
  } catch (err) {
    console.error("setReviewHidden failed:", err);
    return {
      ok: false,
      error: toUserMessage(err, "Couldn't update the review. Please try again."),
    };
  }
};

/** Admin: permanently delete a review. */
export const deleteReview = async (reviewId) => {
  try {
    const id = String(reviewId ?? "").trim();
    if (!id) throw new Error("Invalid review.");

    const response = await authFetch(`${SERVER_URL}/admin/reviews/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    let result = null;
    try {
      result = await response.json();
    } catch {
      result = null;
    }
    if (!response.ok) {
      throw new Error(result?.error || result?.msg || "Failed to delete review");
    }

    revalidatePath(ADMIN_REVIEWS_PATH);
    revalidateProduct(result?.productId);

    return { ok: true, deletedId: result?.deletedId ?? id };
  } catch (err) {
    console.error("deleteReview failed:", err);
    return {
      ok: false,
      error: toUserMessage(err, "Couldn't delete the review. Please try again."),
    };
  }
};
