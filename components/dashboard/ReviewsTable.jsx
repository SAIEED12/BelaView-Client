"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, Modal, Pagination, Table } from "@heroui/react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { StarRating } from "@/components/reviews/StarRating";
import { deleteReview, setReviewHidden } from "@/lib/actions/reviews";
import { productHrefFrom } from "@/lib/product-url";

const iconButtonClassName =
  "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#525252] transition-colors outline-none hover:bg-brand-soft hover:text-brand focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-wait disabled:opacity-60";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "visible", label: "Visible" },
  { key: "hidden", label: "Hidden" },
];

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

const getPageItems = (page, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const window = new Set([1, 2, page - 1, page, page + 1, totalPages - 1, totalPages]);
  const sorted = [...window].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const items = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) items.push("…");
    items.push(p);
    prev = p;
  }
  return items;
};

export function ReviewsTable({
  reviews = [],
  total = 0,
  hiddenCount = 0,
  page = 1,
  limit = 20,
  totalPages = 1,
  initialFilter = "all",
  initialQuery = "",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [busyId, setBusyId] = useState(null);
  const [deletingReview, setDeletingReview] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const rows = useMemo(() => (Array.isArray(reviews) ? reviews : []), [reviews]);
  const safeTotal = Number(total ?? rows.length);
  const safePage = Number(page ?? 1);
  const safeLimit = Number(limit ?? 20);
  const safeTotalPages = Math.max(1, Number(totalPages ?? 1));
  const safeHiddenCount = Number(hiddenCount ?? 0);
  const start = safeTotal === 0 ? 0 : (safePage - 1) * safeLimit + 1;
  const end = Math.min(safeTotal, safePage * safeLimit);
  const pageItems = useMemo(
    () => getPageItems(safePage, safeTotalPages),
    [safePage, safeTotalPages],
  );

  const replaceParams = (changes, { resetPage = false } = {}) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    }
    if (resetPage) params.delete("page");
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  const goToPage = (nextPage) => {
    replaceParams({ page: nextPage <= 1 ? null : nextPage });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    replaceParams({ q: query.trim() || null }, { resetPage: true });
  };

  const handleToggleHidden = async (review) => {
    setBusyId(review._id);
    try {
      const result = await setReviewHidden(review._id, !review.hidden);
      if (!result?.ok) {
        toast.error(result?.error || "Couldn't update the review.");
        return;
      }
      toast.success(
        result.review?.hidden
          ? "Review hidden from the storefront."
          : "Review is visible again.",
      );
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingReview) return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      const result = await deleteReview(deletingReview._id);
      if (!result?.ok) {
        setDeleteError(result?.error || "Couldn't delete the review.");
        return;
      }
      toast.success("Review deleted.");
      setDeletingReview(null);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((filter) => {
            const active = initialFilter === filter.key;
            return (
              <button
                key={filter.key}
                type="button"
                onClick={() =>
                  replaceParams(
                    { filter: filter.key === "all" ? null : filter.key },
                    { resetPage: true },
                  )
                }
                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-ink text-white"
                    : "border border-line bg-white text-smoke hover:border-brand hover:text-brand"
                }`}
              >
                {filter.label}
                {filter.key === "hidden" && safeHiddenCount > 0
                  ? ` (${safeHiddenCount})`
                  : ""}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSearch} className="flex w-full max-w-xs items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search product, customer, comment…"
            aria-label="Search reviews"
            className="w-full rounded-full border border-[#E5E5E5] bg-white px-4 py-2 text-sm text-[#1A1A1A] placeholder:text-[#8A8A8A] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <button
            type="submit"
            className="cursor-pointer rounded-full bg-brand px-4 py-2 text-xs font-semibold tracking-[0.08em] text-white uppercase transition-colors hover:bg-brand-dark"
          >
            Search
          </button>
        </form>
      </div>

      {safeTotal > 0 ? (
        <p className="mb-3 text-sm font-semibold text-brand">
          Showing {start}–{end} of {safeTotal} reviews
        </p>
      ) : null}

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center">
          <p className="text-sm text-smoke">
            {initialQuery
              ? `No reviews found for “${initialQuery}”.`
              : "No reviews yet."}
          </p>
        </div>
      ) : (
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Reviews" className="min-w-220">
              <Table.Header>
                <Table.Column isRowHeader>Product</Table.Column>
                <Table.Column>Reviewer</Table.Column>
                <Table.Column>Rating</Table.Column>
                <Table.Column>Review</Table.Column>
                <Table.Column>Date</Table.Column>
                <Table.Column>Status</Table.Column>
                <Table.Column>Actions</Table.Column>
              </Table.Header>
              <Table.Body>
                {rows.map((review) => (
                  <Table.Row key={review._id}>
                    <Table.Cell>
                      {review.productId ? (
                        <Link
                          href={productHrefFrom(review.productId, review.productSlug)}
                          className="font-bold text-ink transition-colors hover:text-brand"
                        >
                          {review.productName || "View product"}
                        </Link>
                      ) : (
                        <span className="text-smoke">Unknown product</span>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="block font-semibold text-ink">
                        {review.userName || "Customer"}
                      </span>
                      {review.userEmail ? (
                        <span className="block text-xs text-fog">
                          {review.userEmail}
                        </span>
                      ) : null}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-1.5">
                        <StarRating value={review.rating} size={12} />
                        <span className="text-xs font-semibold text-smoke">
                          {review.rating}
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <p className="line-clamp-2 max-w-xs text-sm text-smoke">
                        {review.comment || "—"}
                      </p>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="whitespace-nowrap text-xs text-smoke">
                        {formatDate(review.createdAt)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          review.hidden
                            ? "bg-stone-200 text-stone-700"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {review.hidden ? "Hidden" : "Visible"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleHidden(review)}
                          disabled={busyId === review._id}
                          aria-label={
                            review.hidden
                              ? "Show review on storefront"
                              : "Hide review from storefront"
                          }
                          title={review.hidden ? "Show" : "Hide"}
                          className={iconButtonClassName}
                        >
                          {review.hidden ? (
                            <Eye size={16} strokeWidth={1.75} />
                          ) : (
                            <EyeOff size={16} strokeWidth={1.75} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError(null);
                            setDeletingReview(review);
                          }}
                          aria-label="Delete review"
                          title="Delete"
                          className={`${iconButtonClassName} hover:bg-red-50 hover:text-brand`}
                        >
                          <Trash2 size={16} strokeWidth={1.75} />
                        </button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      )}

      {safeTotalPages > 1 ? (
        <Pagination aria-label="Reviews pagination" className="brand-pagination mt-4">
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous
                isDisabled={safePage <= 1}
                onPress={() => goToPage(safePage - 1)}
                aria-label="Previous page"
              >
                <Pagination.PreviousIcon />
              </Pagination.Previous>
            </Pagination.Item>
            {pageItems.map((item, index) =>
              item === "…" ? (
                <Pagination.Item key={`gap-${index}`}>
                  <Pagination.Ellipsis>…</Pagination.Ellipsis>
                </Pagination.Item>
              ) : (
                <Pagination.Item key={item}>
                  <Pagination.Link
                    isActive={item === safePage}
                    onPress={() => goToPage(item)}
                    aria-label={`Go to page ${item}`}
                  >
                    {item}
                  </Pagination.Link>
                </Pagination.Item>
              ),
            )}
            <Pagination.Item>
              <Pagination.Next
                isDisabled={safePage >= safeTotalPages}
                onPress={() => goToPage(safePage + 1)}
                aria-label="Next page"
              >
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      ) : null}

      <Modal>
        <Modal.Backdrop
          isOpen={deletingReview !== null}
          onOpenChange={(open) => {
            if (!isDeleting && !open) {
              setDeletingReview(null);
              setDeleteError(null);
            }
          }}
          className="bg-black/40 backdrop-blur-sm"
        >
          <Modal.Container placement="auto">
            <Modal.Dialog className="rounded-2xl border border-[#E5E5E5] bg-white shadow-xl shadow-black/10 sm:max-w-md">
              <Modal.CloseTrigger className="rounded-full text-[#8A8A8A] transition-colors hover:bg-[#F5F5F5] hover:text-[#1A1A1A]" />

              <Modal.Header className="border-b border-[#E5E5E5] px-6 py-5">
                <div className="flex items-center gap-3">
                  <Modal.Icon className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                    <Trash2 className="size-5" strokeWidth={1.75} />
                  </Modal.Icon>
                  <Modal.Heading className="font-serif text-2xl text-[#1A1A1A]">
                    Delete review
                  </Modal.Heading>
                </div>
                <p className="mt-2 text-sm leading-5 text-[#525252]">
                  Are you sure you want to permanently delete this review
                  {deletingReview?.productName
                    ? ` for “${deletingReview.productName}”`
                    : ""}
                  ? This action cannot be undone.
                </p>
              </Modal.Header>

              <Modal.Footer className="border-t border-[#E5E5E5] bg-[#FAFAFA] px-6 py-4">
                {deleteError ? (
                  <p className="mr-auto text-sm text-brand" role="alert">
                    {deleteError}
                  </p>
                ) : null}
                <Button
                  onPress={() => {
                    if (!isDeleting) {
                      setDeletingReview(null);
                      setDeleteError(null);
                    }
                  }}
                  isDisabled={isDeleting}
                  className="cursor-pointer rounded-full border border-[#E5E5E5] bg-transparent px-4 py-2 text-xs font-semibold tracking-[0.12em] text-[#1A1A1A] transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
                >
                  CANCEL
                </Button>
                <Button
                  onPress={handleDelete}
                  isPending={isDeleting}
                  className="cursor-pointer rounded-full bg-brand px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? "DELETING…" : "DELETE"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
