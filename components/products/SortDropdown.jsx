"use client";

import { DEFAULT_SORT, normalizeSort, SORT_OPTIONS } from "@/lib/productFilters";
import { useFilterNavigation } from "./FilterNavigationProvider";

export function SortDropdown({ sort = DEFAULT_SORT }) {
  const { navigate } = useFilterNavigation();
  const value = normalizeSort(sort);

  const handleChange = (event) => {
    const next = event.target.value;
    navigate((params) => {
      if (next && next !== DEFAULT_SORT) {
        params.set("sort", next);
      } else {
        params.delete("sort");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="products-sort"
        className="hidden shrink-0 text-xs font-semibold tracking-[0.08em] text-smoke uppercase sm:block"
      >
        Sort by
      </label>
      <select
        id="products-sort"
        value={value}
        onChange={handleChange}
        className="h-10 cursor-pointer rounded-xl border border-line bg-white px-3 text-sm font-medium text-ink outline-none transition-colors hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/20"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
