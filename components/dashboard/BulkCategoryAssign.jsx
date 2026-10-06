"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Users } from "lucide-react";
import toast from "react-hot-toast";
import { bulkAssignProductCategory, getProductsPage } from "@/lib/actions/products";

const PAGE_SIZE = 50;

const selectClassName =
  "rounded-lg border border-[#E5E5E5] bg-white px-2.5 py-1.5 text-xs text-[#1A1A1A] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-[#F5F5F5] disabled:text-[#8A8A8A]";

export function BulkCategoryAssign({ categories = [] }) {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [onlyUnassigned, setOnlyUnassigned] = useState(true);
  const [selected, setSelected] = useState([]);
  const [targetCategory, setTargetCategory] = useState("");
  const [targetSubcategory, setTargetSubcategory] = useState("");
  const [isPending, setIsPending] = useState(false);

  const categorySlugs = new Set(categories.map((c) => c.slug));
  const isUnassigned = (product) => {
    const raw = String(product?.category ?? "").trim();
    if (!raw) return true;
    return !categorySlugs.has(raw);
  };

  const visible = onlyUnassigned ? products.filter(isUnassigned) : products;
  const subcategories =
    categories.find((c) => c.slug === targetCategory)?.subcategories ?? [];

  const load = async (nextPage = 1) => {
    setLoading(true);
    try {
      const result = await getProductsPage({ page: nextPage, limit: PAGE_SIZE });
      setProducts(result.products);
      setPage(result.page);
      setTotalPages(result.totalPages);
      setTotal(result.total);
      setSelected([]);
    } catch {
      toast.error("Couldn't load products.");
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  };

  const allVisibleSelected =
    visible.length > 0 && visible.every((p) => selected.includes(String(p._id)));

  const toggleAll = () => {
    const visibleIds = visible.map((p) => String(p._id));
    if (allVisibleSelected) {
      setSelected((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelected((prev) => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const handleApply = async () => {
    if (!targetCategory) {
      toast.error("Pick a target category first.");
      return;
    }
    setIsPending(true);
    try {
      const result = await bulkAssignProductCategory(
        selected,
        targetCategory,
        targetSubcategory,
      );
      toast.success(
        `Moved ${result?.modifiedCount ?? selected.length} product(s) to ${targetCategory}`,
        { duration: 5000 },
      );
      await load(page);
      router.refresh();
    } catch (error) {
      toast.error(error?.message || "Couldn't update the products.", { duration: 6000 });
    } finally {
      setIsPending(false);
    }
  };

  if (categories.length === 0) return null;

  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-ink uppercase">
            <Users size={14} className="text-fog" aria-hidden="true" />
            Move products into categories
          </h2>
          <p className="mt-1 text-sm text-smoke">
            Products tagged before categories existed need to be filed. Tick them,
            pick a target, apply.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load(1)}
          disabled={loading}
          className="cursor-pointer rounded-full border border-line px-4 py-2 text-xs font-semibold tracking-[0.12em] text-ink uppercase transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Loading…" : "Load products"}
        </button>
      </div>

      {products.length > 0 ? (
        <>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="bulk-target-category" className="text-xs font-semibold text-ink">
                Target category
              </label>
              <select
                id="bulk-target-category"
                value={targetCategory}
                onChange={(event) => {
                  setTargetCategory(event.target.value);
                  setTargetSubcategory("");
                }}
                className={selectClassName}
              >
                <option value="">Select…</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="bulk-target-sub" className="text-xs font-semibold text-ink">
                Sub-category
              </label>
              <select
                id="bulk-target-sub"
                value={targetSubcategory}
                disabled={!targetCategory || subcategories.length === 0}
                onChange={(event) => setTargetSubcategory(event.target.value)}
                className={selectClassName}
              >
                <option value="">{subcategories.length === 0 ? "None" : "None"}</option>
                {subcategories.map((sub) => (
                  <option key={sub.slug} value={sub.slug}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleApply}
              disabled={isPending || selected.length === 0 || !targetCategory}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 size={13} className="animate-spin" aria-hidden="true" />
              ) : null}
              {isPending
                ? "Applying…"
                : `Apply to ${selected.length} selected`}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 border-b border-line pb-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleAll}
                className="h-4 w-4 cursor-pointer accent-ink"
              />
              Select all on this page
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={onlyUnassigned}
                onChange={(event) => {
                  setOnlyUnassigned(event.target.checked);
                  setSelected([]);
                }}
                className="h-4 w-4 cursor-pointer accent-ink"
              />
              Only show products not yet in a category
            </label>
            <span className="text-xs text-fog">
              {selected.length} selected · showing {visible.length} of {total} products
            </span>
          </div>

          <ul className="mt-2 max-h-80 divide-y divide-[#F5F5F5] overflow-y-auto">
            {visible.length === 0 ? (
              <li className="py-6 text-center text-sm text-smoke">
                {onlyUnassigned
                  ? "Every product on this page is already in a category."
                  : "No products on this page."}
              </li>
            ) : (
              visible.map((product) => {
                const id = String(product._id);
                return (
                  <li key={id} className="flex items-center gap-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.includes(id)}
                      onChange={() => toggle(id)}
                      aria-label={`Select ${product.name}`}
                      className="h-4 w-4 shrink-0 cursor-pointer accent-ink"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm text-ink">
                      {product.name}
                    </span>
                    <span className="shrink-0 text-xs text-fog">
                      {isUnassigned(product)
                        ? `free text: ${product.category || "none"}`
                        : `${product.category}${product.subcategory ? ` / ${product.subcategory}` : ""}`}
                    </span>
                  </li>
                );
              })
            )}
          </ul>

          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <button
              type="button"
              onClick={() => load(Math.max(1, page - 1))}
              disabled={loading || page <= 1}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-mist disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={14} aria-hidden="true" />
              Previous
            </button>
            <span className="text-xs text-fog">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => load(Math.min(totalPages, page + 1))}
              disabled={loading || page >= totalPages}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-mist disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}