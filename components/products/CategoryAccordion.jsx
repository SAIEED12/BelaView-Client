"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Minus } from "lucide-react";
import { setListParam } from "@/lib/productFilters";
import { useFilterNavigation } from "./FilterNavigationProvider";

const INITIAL_VISIBLE_GROUPS = 6;

const facetSlug = (entry) => String(entry?.slug ?? entry?.name ?? "");

const facetSubcategories = (entry) =>
  Array.isArray(entry?.subcategories) ? entry.subcategories : [];

const FacetCheckbox = ({
  checked,
  indeterminate = false,
  onChange,
  label,
  count = 0,
  muted = false,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-[13px]">
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={`relative flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand/30 peer-focus-visible:ring-offset-1 ${
          checked || indeterminate
            ? "border-brand bg-brand"
            : "border-line bg-white"
        }`}
      >
        {indeterminate ? (
          <Minus size={11} strokeWidth={3.5} className="text-white" />
        ) : (
          <Check
            size={11}
            strokeWidth={3.5}
            className={`text-white transition-opacity ${
              checked ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </span>
      <span
        title={label}
        className={`min-w-0 flex-1 truncate text-left ${
          muted ? "text-smoke" : "font-semibold text-ink"
        }`}
      >
        {label}
      </span>
      <span className="shrink-0 text-xs tabular-nums text-fog">
        ({count})
      </span>
    </label>
  );
};

export function CategoryAccordion({
  categories = [],
  selectedCategories = [],
  selectedSubcategories = [],
}) {
  const { navigate } = useFilterNavigation();
  const [showAll, setShowAll] = useState(false);
  const [openSlugs, setOpenSlugs] = useState(() => {
    const initial = new Set();
    for (const category of categories) {
      const slug = facetSlug(category);
      const children = facetSubcategories(category).map(facetSlug);
      const hasSelectedChild = children.some((child) =>
        selectedSubcategories.includes(child),
      );
      if (selectedCategories.includes(slug) || hasSelectedChild) {
        initial.add(slug);
      }
    }
    return initial;
  });

  const visible = showAll
    ? categories
    : categories.slice(0, INITIAL_VISIBLE_GROUPS);
  const hiddenCount = Math.max(0, categories.length - INITIAL_VISIBLE_GROUPS);

  const toggleOpen = (slug) => {
    setOpenSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const navigateSelections = (parents, subs) => {
    navigate((params) => {
      setListParam(params, "category", parents);
      setListParam(params, "subcategory", subs);
    });
  };

  // Parent selection writes only the parent slug (all children are implied).
  // Turning it off drops the parent and any explicitly selected children.
  const toggleParent = (category) => {
    const slug = facetSlug(category);
    const childSlugs = facetSubcategories(category).map(facetSlug);
    const parentSelected = selectedCategories.includes(slug);
    const allChildrenSelected =
      childSlugs.length > 0 &&
      childSlugs.every((child) => selectedSubcategories.includes(child));
    const isOn = parentSelected || allChildrenSelected;

    let parents = selectedCategories.filter((value) => value !== slug);
    const subs = selectedSubcategories.filter(
      (value) => !childSlugs.includes(value),
    );
    if (!isOn) parents = [...parents, slug];
    navigateSelections(parents, subs);
  };

  // Child selection writes only the child slug (filtering by subcategory is
  // supported by the API, and keeps the parent's tri-state meaningful). When
  // every child ends up selected the selection collapses to the parent slug.
  const toggleChild = (category, sub) => {
    const parentSlug = facetSlug(category);
    const subSlug = facetSlug(sub);
    const childSlugs = facetSubcategories(category).map(facetSlug);
    const parentSelected = selectedCategories.includes(parentSlug);

    // Materialize the current child state (a selected parent implies all children).
    const currentSubs = new Set(
      parentSelected ? childSlugs : selectedSubcategories,
    );
    if (currentSubs.has(subSlug)) {
      currentSubs.delete(subSlug);
    } else {
      currentSubs.add(subSlug);
    }

    const allSelected =
      childSlugs.length > 0 &&
      childSlugs.every((child) => currentSubs.has(child));
    const parents = selectedCategories.filter(
      (value) => value !== parentSlug,
    );
    if (allSelected) parents.push(parentSlug);
    const subs = [...currentSubs].filter(
      (value) => !(allSelected && childSlugs.includes(value)),
    );
    navigateSelections(parents, subs);
  };

  return (
    <div className="min-w-0">
      <ul className="space-y-0.5">
        {visible.map((category) => {
          const slug = facetSlug(category);
          if (!slug) return null;
          const children = facetSubcategories(category);
          const childSlugs = children.map(facetSlug);
          const isOpen = openSlugs.has(slug);
          const parentSelected = selectedCategories.includes(slug);
          const selectedChildCount = childSlugs.filter((child) =>
            selectedSubcategories.includes(child),
          ).length;
          const allChildrenSelected =
            childSlugs.length > 0 &&
            selectedChildCount === childSlugs.length;
          const checked = parentSelected || allChildrenSelected;
          const indeterminate = !checked && selectedChildCount > 0;
          const panelId = `category-group-${slug}`;

          return (
            <li key={slug} className="min-w-0">
              <div className="flex min-w-0 items-center gap-0.5 rounded-lg pr-1 transition-colors hover:bg-mist">
                {children.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => toggleOpen(slug)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    aria-label={`${isOpen ? "Collapse" : "Expand"} ${category.name ?? slug}`}
                    className="inline-flex h-8 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-fog transition-colors hover:text-ink"
                  >
                    <ChevronDown
                      size={14}
                      aria-hidden="true"
                      className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                ) : (
                  <span aria-hidden="true" className="h-8 w-6 shrink-0" />
                )}
                <FacetCheckbox
                  checked={checked}
                  indeterminate={indeterminate}
                  onChange={() => toggleParent(category)}
                  label={category.name ?? slug}
                  count={category.count ?? 0}
                />
              </div>

              {children.length > 0 && isOpen ? (
                <ul
                  id={panelId}
                  className="mt-0.5 mb-0.5 ml-6 space-y-0.5 border-l border-line pl-2"
                >
                  {children.map((sub) => {
                    const subSlug = facetSlug(sub);
                    if (!subSlug) return null;
                    const subChecked =
                      parentSelected || selectedSubcategories.includes(subSlug);
                    return (
                      <li key={subSlug} className="min-w-0">
                        <div className="rounded-lg transition-colors hover:bg-mist">
                          <FacetCheckbox
                            checked={subChecked}
                            onChange={() => toggleChild(category, sub)}
                            label={sub.name ?? subSlug}
                            count={sub.count ?? 0}
                            muted
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>

      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          className="mt-2 cursor-pointer text-xs font-semibold text-brand hover:underline"
        >
          {showAll ? "Show less" : `Show more (${hiddenCount})`}
        </button>
      ) : null}
    </div>
  );
}
