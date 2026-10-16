"use client";

import { clearFilterParams } from "@/lib/productFilters";
import { useFilterNavigation } from "./FilterNavigationProvider";

export function EmptyProductsState({ searchText = "" }) {
  const { navigate } = useFilterNavigation();

  const handleClear = () => {
    navigate((params) => {
      clearFilterParams(params, { keepSearch: false });
    });
  };

  return (
    <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
      <p className="font-serif text-xl text-ink">No products found</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-smoke">
        {searchText
          ? `Nothing matches “${searchText}” with the current filters.`
          : "Nothing matches the selected filters. Try removing a few of them."}
      </p>
      <button
        type="button"
        onClick={handleClear}
        className="mt-6 cursor-pointer rounded-full bg-brand px-6 py-2.5 text-xs font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:bg-brand-dark"
      >
        Clear filters
      </button>
    </div>
  );
}
