export const DEFAULT_SORT = "newest";

export const SORT_OPTIONS = [
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "name", label: "Name A–Z" },
];

export const SORT_IDS = SORT_OPTIONS.map((option) => option.id);

export const normalizeSort = (sort) =>
  SORT_IDS.includes(sort) ? sort : DEFAULT_SORT;

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
  (sort && sort !== DEFAULT_SORT ? 1 : 0);

export const formatBDT = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "৳0";
  return `৳${amount.toLocaleString("en-US")}`;
};

export const setListParam = (params, key, values) => {
  params.delete(key);
  for (const value of values) params.append(key, value);
};

export const clearFilterParams = (params, { keepSearch = true } = {}) => {
  params.delete("category");
  params.delete("subcategory");
  params.delete("minPrice");
  params.delete("maxPrice");
  params.delete("inStock");
  params.delete("sort");
  // Cleared filters always start at page 1
  params.delete("page");
  if (!keepSearch) params.delete("search");
  return params;
};
