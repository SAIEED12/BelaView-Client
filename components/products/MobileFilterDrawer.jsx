"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { clearFilterParams, countActiveFilters } from "@/lib/productFilters";
import { FilterSidebar } from "./FilterSidebar";
import { useFilterNavigation } from "./FilterNavigationProvider";

export function MobileFilterDrawer({
  facets,
  selectedCategories = [],
  selectedSubcategories = [],
  minPrice = "",
  maxPrice = "",
  inStock = false,
  sort = "newest",
}) {
  const { navigate } = useFilterNavigation();
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
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const handleClearAll = () => {
    navigate((params) => {
      clearFilterParams(params);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-xs font-semibold tracking-[0.1em] text-ink uppercase transition-colors hover:border-brand hover:text-brand lg:hidden"
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
          className="fixed inset-0 z-50 lg:hidden"
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm"
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-serif text-lg text-ink">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-smoke transition-colors hover:bg-mist hover:text-ink"
              >
                <X size={17} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-x-hidden overflow-y-auto bg-cream px-4 py-4">
              <FilterSidebar
                showHeader={false}
                facets={facets}
                selectedCategories={selectedCategories}
                selectedSubcategories={selectedSubcategories}
                minPrice={minPrice}
                maxPrice={maxPrice}
                inStock={inStock}
                sort={sort}
              />
            </div>

            <div className="flex items-center gap-3 border-t border-line px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={handleClearAll}
                className="h-11 flex-1 cursor-pointer rounded-xl border border-line bg-white text-xs font-semibold tracking-[0.12em] text-ink uppercase transition-colors hover:border-brand hover:text-brand"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-11 flex-1 cursor-pointer rounded-xl bg-ink text-xs font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:bg-brand"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
