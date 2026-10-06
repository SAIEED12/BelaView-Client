"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const PRICE_DEBOUNCE_MS = 500;

export const SORT_OPTIONS = [
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "name", label: "Name A–Z" },
];

export const countActiveFilters = ({
  categories,
  subcategories,
  minPrice,
  maxPrice,
  inStock,
  sort,
}) =>
  (Array.isArray(categories) ? categories.length : 0) +
  (Array.isArray(subcategories) ? subcategories.length : 0) +
  (minPrice || maxPrice ? 1 : 0) +
  (inStock ? 1 : 0) +
  (sort && sort !== "newest" ? 1 : 0);

const sectionTitleClassName =
  "text-xs font-semibold uppercase tracking-[0.14em] text-ink";

const facetSlug = (entry) => String(entry?.slug ?? entry?.name ?? "");

const facetSubcategories = (entry) =>
  Array.isArray(entry?.subcategories) ? entry.subcategories : [];

export function ProductFilters({
  facets,
  selectedCategories = [],
  selectedSubcategories = [],
  minPrice = "",
  maxPrice = "",
  inStock = false,
  sort = "newest",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [minValue, setMinValue] = useState(minPrice);
  const [maxValue, setMaxValue] = useState(maxPrice);
  const timerRef = useRef(null);
  const searchParamsRef = useRef(searchParams?.toString() ?? "");
  const committedRef = useRef(
    JSON.stringify({
      minPrice,
      maxPrice,
      selectedCategories,
      selectedSubcategories,
      inStock,
      sort,
    }),
  );

  useEffect(() => {
    searchParamsRef.current = searchParams?.toString() ?? "";
  }, [searchParams]);

  // Sync only on external URL changes (back/forward, clear-all), never while typing.
  useEffect(() => {
    const snapshot = JSON.stringify({
      minPrice,
      maxPrice,
      selectedCategories,
      selectedSubcategories,
      inStock,
      sort,
    });
    if (snapshot !== committedRef.current) {
      committedRef.current = snapshot;
      setMinValue(minPrice);
      setMaxValue(maxPrice);
    }
  }, [minPrice, maxPrice, selectedCategories, selectedSubcategories, inStock, sort]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const navigate = (mutate) => {
    const params = new URLSearchParams(searchParamsRef.current);
    mutate(params);
    // New filter selections always start at page 1
    params.delete("page");
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  const commitSnapshot = (snapshot) => {
    committedRef.current = JSON.stringify(snapshot);
  };

  const snapshotOf = (overrides = {}) => ({
    minPrice: overrides.minPrice ?? minValue,
    maxPrice: overrides.maxValue ?? maxValue,
    selectedCategories: overrides.selectedCategories ?? selectedCategories,
    selectedSubcategories:
      overrides.selectedSubcategories ?? selectedSubcategories,
    inStock: overrides.inStock ?? inStock,
    sort: overrides.sort ?? sort,
  });

  const setListParam = (params, key, values) => {
    params.delete(key);
    for (const value of values) params.append(key, value);
  };

  const toggleCategory = (slug) => {
    const current = Array.isArray(selectedCategories) ? selectedCategories : [];
    const next = current.includes(slug)
      ? current.filter((value) => value !== slug)
      : [...current, slug];
    // Deselecting a parent must also drop its selected sub-categories.
    const subs = Array.isArray(selectedSubcategories) ? selectedSubcategories : [];
    const parent = categories.find((entry) => facetSlug(entry) === slug);
    const childSlugs = new Set(facetSubcategories(parent).map(facetSlug));
    const nextSubs = current.includes(slug)
      ? subs.filter((value) => !childSlugs.has(value))
      : subs;
    commitSnapshot(snapshotOf({ selectedCategories: next, selectedSubcategories: nextSubs }));
    navigate((params) => {
      setListParam(params, "category", next);
      setListParam(params, "subcategory", nextSubs);
    });
  };

  const toggleSubcategory = (parentSlug, subSlug) => {
    const current = Array.isArray(selectedSubcategories) ? selectedSubcategories : [];
    const next = current.includes(subSlug)
      ? current.filter((value) => value !== subSlug)
      : [...current, subSlug];
    const parents = Array.isArray(selectedCategories) ? selectedCategories : [];
    const nextParents = parents.includes(parentSlug)
      ? parents
      : [...parents, parentSlug];
    commitSnapshot(snapshotOf({ selectedCategories: nextParents, selectedSubcategories: next }));
    navigate((params) => {
      setListParam(params, "category", nextParents);
      setListParam(params, "subcategory", next);
    });
  };

  const commitPrices = (minRaw, maxRaw) => {
    const min = String(minRaw ?? "").trim();
    const max = String(maxRaw ?? "").trim();
    commitSnapshot(snapshotOf({ minPrice: min, maxPrice: max }));
    navigate((params) => {
      if (min) {
        params.set("minPrice", min);
      } else {
        params.delete("minPrice");
      }
      if (max) {
        params.set("maxPrice", max);
      } else {
        params.delete("maxPrice");
      }
    });
  };

  const schedulePriceCommit = (minRaw, maxRaw) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => commitPrices(minRaw, maxRaw), PRICE_DEBOUNCE_MS);
  };

  const handleSortChange = (e) => {
    const next = e.target.value;
    commitSnapshot(snapshotOf({ sort: next }));
    navigate((params) => {
      if (next && next !== "newest") {
        params.set("sort", next);
      } else {
        params.delete("sort");
      }
    });
  };

  const handleStockChange = (e) => {
    const next = e.target.checked;
    commitSnapshot(snapshotOf({ inStock: next }));
    navigate((params) => {
      if (next) {
        params.set("inStock", "true");
      } else {
        params.delete("inStock");
      }
    });
  };

  const handleClearAll = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    commitSnapshot({
      minPrice: "",
      maxPrice: "",
      selectedCategories: [],
      selectedSubcategories: [],
      inStock: false,
      sort: "newest",
    });
    setMinValue("");
    setMaxValue("");
    navigate((params) => {
      params.delete("category");
      params.delete("subcategory");
      params.delete("minPrice");
      params.delete("maxPrice");
      params.delete("inStock");
      params.delete("sort");
    });
  };

  const categories = Array.isArray(facets?.categories) ? facets.categories : [];
  const activeCount = countActiveFilters({
    categories: selectedCategories,
    subcategories: selectedSubcategories,
    minPrice,
    maxPrice,
    inStock,
    sort,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={sectionTitleClassName}>Filters</h2>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={handleClearAll}
            className="cursor-pointer text-xs font-semibold text-brand hover:underline"
          >
            Clear all ({activeCount})
          </button>
        ) : null}
      </div>

      <div>
        <label htmlFor="products-sort" className={`${sectionTitleClassName} mb-2 block`}>
          Sort by
        </label>
        <select
          id="products-sort"
          value={SORT_OPTIONS.some((o) => o.id === sort) ? sort : "newest"}
          onChange={handleSortChange}
          className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {categories.length > 0 ? (
        <fieldset>
          <legend className={`${sectionTitleClassName} mb-2`}>Category</legend>
          <ul className="space-y-1">
            {categories.map((category) => {
              const slug = facetSlug(category);
              if (!slug) return null;
              const checked = selectedCategories.includes(slug);
              const subs = facetSubcategories(category);
              return (
                <li key={slug}>
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 text-sm font-semibold text-ink transition-colors hover:bg-mist">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(slug)}
                      className="h-4 w-4 shrink-0 cursor-pointer accent-ink"
                    />
                    <span className="flex-1 truncate">{category.name ?? slug}</span>
                    <span className="shrink-0 text-xs text-fog">{category.count ?? 0}</span>
                  </label>
                  {subs.length > 0 ? (
                    <ul className="ml-6 mt-0.5 space-y-0.5 border-l border-line pl-3">
                      {subs.map((sub) => {
                        const subSlug = facetSlug(sub);
                        if (!subSlug) return null;
                        const subChecked = selectedSubcategories.includes(subSlug);
                        return (
                          <li key={subSlug}>
                            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 text-sm text-smoke transition-colors hover:bg-mist">
                              <input
                                type="checkbox"
                                checked={subChecked}
                                onChange={() => toggleSubcategory(slug, subSlug)}
                                className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-ink"
                              />
                              <span className="flex-1 truncate">{sub.name ?? subSlug}</span>
                              <span className="shrink-0 text-xs text-fog">{sub.count ?? 0}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </fieldset>
      ) : null}

      <fieldset>
        <legend className={`${sectionTitleClassName} mb-2`}>Price (৳)</legend>
        <div className="flex items-center gap-2">
          <label htmlFor="products-min-price" className="sr-only">
            Minimum price
          </label>
          <input
            id="products-min-price"
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Min"
            value={minValue}
            onChange={(e) => {
              setMinValue(e.target.value);
              schedulePriceCommit(e.target.value, maxValue);
            }}
            onBlur={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              commitPrices(minValue, maxValue);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (timerRef.current) clearTimeout(timerRef.current);
                commitPrices(minValue, maxValue);
              }
            }}
            className="w-full min-w-0 rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-smoke focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <span aria-hidden="true" className="shrink-0 text-sm text-fog">
            –
          </span>
          <label htmlFor="products-max-price" className="sr-only">
            Maximum price
          </label>
          <input
            id="products-max-price"
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Max"
            value={maxValue}
            onChange={(e) => {
              setMaxValue(e.target.value);
              schedulePriceCommit(minValue, e.target.value);
            }}
            onBlur={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              commitPrices(minValue, maxValue);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (timerRef.current) clearTimeout(timerRef.current);
                commitPrices(minValue, maxValue);
              }
            }}
            className="w-full min-w-0 rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-smoke focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 text-sm text-ink transition-colors hover:bg-mist">
        <input
          type="checkbox"
          checked={Boolean(inStock)}
          onChange={handleStockChange}
          className="h-4 w-4 shrink-0 cursor-pointer accent-ink"
        />
        In stock only
      </label>
    </div>
  );
}