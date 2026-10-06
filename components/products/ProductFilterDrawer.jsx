"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductFilters, countActiveFilters } from "./ProductFilters";

export function ProductFilterDrawer({
  facets,
  selectedCategories = [],
  selectedSubcategories = [],
  minPrice = "",
  maxPrice = "",
  inStock = false,
  sort = "newest",
}) {
  const [open, setOpen] = useState(false);
  const activeCount = countActiveFilters({
    categories: selectedCategories,
    subcategories: selectedSubcategories,
    minPrice,
    maxPrice,
    inStock,
    sort,
  });

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open ]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-semibold tracking-[0.12em] text-ink uppercase transition-colors hover:border-brand hover:text-brand"
      >
        <SlidersHorizontal size={15} aria-hidden="true" />
        Filters
        {activeCount > 0 ? (
          <span
            aria-label={`${activeCount} filters active`}
            className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white"
          >
            {activeCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Product filters"
          className="fixed inset-0 z-50"
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-serif text-lg text-ink">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-smoke transition-colors hover:bg-mist hover:text-ink"
              >
                <X size={17} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <ProductFilters
                facets={facets}
                selectedCategories={selectedCategories}
                selectedSubcategories={selectedSubcategories}
                minPrice={minPrice}
                maxPrice={maxPrice}
                inStock={inStock}
                sort={sort}
              />
            </div>
            <div className="border-t border-line px-5 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full cursor-pointer rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:bg-brand"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
