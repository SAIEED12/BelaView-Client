"use client";

import { useId } from "react";
import { Coins, LayoutGrid, Package } from "lucide-react";
import { clearFilterParams, countActiveFilters } from "@/lib/productFilters";
import { CategoryAccordion } from "./CategoryAccordion";
import { PriceFilter } from "./PriceFilter";
import { useFilterNavigation } from "./FilterNavigationProvider";

const FilterCard = ({ icon: Icon, title, children }) => (
  <section className="overflow-hidden rounded-xl border border-line bg-white">
    <h3 className="flex items-center gap-2.5 border-b border-line px-5 py-3.5 text-[13px] font-semibold tracking-[0.14em] text-ink uppercase">
      <Icon size={16} aria-hidden="true" className="shrink-0 text-brand" />
      {title}
    </h3>
    <div className="px-5 py-4">{children}</div>
  </section>
);

const STOCK_OPTIONS = [
  { id: "all", label: "All Products", inStock: false },
  { id: "in-stock", label: "In Stock", inStock: true },
];

const StockStatusRadioGroup = ({ inStock, onChange }) => {
  const groupId = useId();
  return (
    <div role="radiogroup" aria-label="Stock status" className="space-y-2.5">
      {STOCK_OPTIONS.map((option) => {
        const checked = inStock === option.inStock;
        return (
          <label
            key={option.id}
            className="flex cursor-pointer items-center gap-2.5 text-[13px]"
          >
            <input
              type="radio"
              name={`${groupId}-stock-status`}
              checked={checked}
              onChange={() => onChange(option.inStock)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand/30 peer-focus-visible:ring-offset-1 ${
                checked ? "border-brand" : "border-line"
              }`}
            >
              {checked ? (
                <span className="h-2.5 w-2.5 rounded-full bg-brand" />
              ) : null}
            </span>
            <span
              className={`font-semibold ${checked ? "text-ink" : "text-smoke"}`}
            >
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
};

export function FilterSidebar({
  facets,
  selectedCategories = [],
  selectedSubcategories = [],
  minPrice = "",
  maxPrice = "",
  inStock = false,
  sort = "newest",
  showHeader = true,
}) {
  const { navigate } = useFilterNavigation();
  const activeCount = countActiveFilters({
    categories: selectedCategories,
    subcategories: selectedSubcategories,
    minPrice,
    maxPrice,
    inStock,
    sort,
  });

  const handleClearAll = () => {
    navigate((params) => {
      clearFilterParams(params);
    });
  };

  const handleStockChange = (nextInStock) => {
    navigate((params) => {
      if (nextInStock) {
        params.set("inStock", "true");
      } else {
        params.delete("inStock");
      }
    });
  };

  return (
    <div className="min-w-0 space-y-4">
      {showHeader && activeCount > 0 ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleClearAll}
            className="cursor-pointer text-xs font-semibold text-brand hover:underline"
          >
            Clear all ({activeCount})
          </button>
        </div>
      ) : null}

      <FilterCard icon={LayoutGrid} title="Categories">
        <CategoryAccordion
          categories={facets?.categories ?? []}
          selectedCategories={selectedCategories}
          selectedSubcategories={selectedSubcategories}
        />
      </FilterCard>

      <FilterCard icon={Coins} title="Price Range">
        <PriceFilter
          priceBounds={facets?.priceBounds}
          minPrice={minPrice}
          maxPrice={maxPrice}
        />
      </FilterCard>

      <FilterCard icon={Package} title="Stock Status">
        <StockStatusRadioGroup
          inStock={Boolean(inStock)}
          onChange={handleStockChange}
        />
      </FilterCard>
    </div>
  );
}
