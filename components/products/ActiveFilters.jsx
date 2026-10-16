"use client";

import { X } from "lucide-react";
import {
  clearFilterParams,
  countActiveFilters,
  formatBDT,
  setListParam,
} from "@/lib/productFilters";
import { useFilterNavigation } from "./FilterNavigationProvider";

const facetSlug = (entry) => String(entry?.slug ?? entry?.name ?? "");

const findFacetName = (categories, slug) => {
  for (const category of categories) {
    if (facetSlug(category) === slug) return category.name ?? slug;
    for (const sub of Array.isArray(category?.subcategories)
      ? category.subcategories
      : []) {
      if (facetSlug(sub) === slug) return sub.name ?? slug;
    }
  }
  return slug;
};

export function ActiveFilters({
  facets,
  selectedCategories = [],
  selectedSubcategories = [],
  minPrice = "",
  maxPrice = "",
  inStock = false,
  sort = "newest",
}) {
  const { navigate } = useFilterNavigation();
  const categories = Array.isArray(facets?.categories) ? facets.categories : [];
  const activeCount = countActiveFilters({
    categories: selectedCategories,
    subcategories: selectedSubcategories,
    minPrice,
    maxPrice,
    inStock,
    sort,
  });

  if (activeCount === 0) return null;

  const priceLabel =
    minPrice && maxPrice
      ? `${formatBDT(minPrice)} – ${formatBDT(maxPrice)}`
      : minPrice
        ? `From ${formatBDT(minPrice)}`
        : `Up to ${formatBDT(maxPrice)}`;

  const chips = [];

  for (const slug of selectedCategories) {
    const label = findFacetName(categories, slug);
    chips.push({
      key: `category-${slug}`,
      label,
      remove: () =>
        navigate((params) => {
          setListParam(
            params,
            "category",
            selectedCategories.filter((value) => value !== slug),
          );
        }),
    });
  }

  for (const slug of selectedSubcategories) {
    const label = findFacetName(categories, slug);
    chips.push({
      key: `subcategory-${slug}`,
      label,
      remove: () =>
        navigate((params) => {
          setListParam(
            params,
            "subcategory",
            selectedSubcategories.filter((value) => value !== slug),
          );
        }),
    });
  }

  if (minPrice || maxPrice) {
    chips.push({
      key: "price",
      label: priceLabel,
      remove: () =>
        navigate((params) => {
          params.delete("minPrice");
          params.delete("maxPrice");
        }),
    });
  }

  if (inStock) {
    chips.push({
      key: "in-stock",
      label: "In stock",
      remove: () =>
        navigate((params) => {
          params.delete("inStock");
        }),
    });
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.remove}
          aria-label={`Remove filter: ${chip.label}`}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white py-1.5 pr-2 pl-3 text-xs font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
        >
          {chip.label}
          <X size={12} aria-hidden="true" />
        </button>
      ))}
      <button
        type="button"
        onClick={() =>
          navigate((params) => {
            clearFilterParams(params);
          })
        }
        className="cursor-pointer px-1 text-xs font-semibold text-brand hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
