import Link from "next/link";
import { Suspense } from "react";
import { ProductSearchInput } from "@/components/products/ProductSearchInput";
import { ProductGrid } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductFilterDrawer } from "@/components/products/ProductFilterDrawer";
import { PaginationControls } from "@/components/PaginationControls";

const SERVER_URL = process.env.SERVER_URL;
const PAGE_SIZE = 20;

const getParam = (query, key) => {
  const value = query?.[key];
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
};

const getListParam = (query, key) => {
  const value = query?.[key];
  const entries = Array.isArray(value) ? value : value !== undefined ? [value] : [];
  return entries
    .flatMap((entry) => String(entry).split(","))
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const AllProductsPage = async ({ searchParams }) => {
  const searchQuery = await searchParams;
  const rawSearch = getParam(searchQuery, "search");
  const rawPage = getParam(searchQuery, "page");
  const parsedPage = Number.parseInt(rawPage, 10);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const searchText = rawSearch.trim();

  const categoryList = getListParam(searchQuery, "category");
  const subcategoryList = getListParam(searchQuery, "subcategory");
  const rawMinPrice = getParam(searchQuery, "minPrice").trim();
  const rawMaxPrice = getParam(searchQuery, "maxPrice").trim();
  const inStock = getParam(searchQuery, "inStock").trim().toLowerCase() === "true";
  const rawSort = getParam(searchQuery, "sort").trim().toLowerCase();
  const sort = ["newest", "price-asc", "price-desc", "name"].includes(rawSort) ? rawSort : "newest";

  const params = new URLSearchParams();
  if (searchText) params.set("search", searchText);
  for (const category of categoryList) params.append("category", category);
  for (const subcategory of subcategoryList) params.append("subcategory", subcategory);
  if (rawMinPrice) params.set("minPrice", rawMinPrice);
  if (rawMaxPrice) params.set("maxPrice", rawMaxPrice);
  if (inStock) params.set("inStock", "true");
  if (sort !== "newest") params.set("sort", sort);
  params.set("page", String(page));
  params.set("limit", String(PAGE_SIZE));
  const res = await fetch(`${SERVER_URL}/products?${params.toString()}`, {
    cache: "no-store",
  });
  let products = [];
  let total = 0;
  let totalPages = 1;
  let currentPage = page;
  let facets = { categories: [], priceBounds: { min: 0, max: 0 } };
  if (res.ok) {
    try {
      const data = await res.json();
      if (data && typeof data === "object" && !Array.isArray(data)) {
        products = Array.isArray(data.products) ? data.products : [];
        total = Number(data.total ?? products.length);
        totalPages = Math.max(1, Number(data.totalPages ?? 1));
        currentPage = Number(data.page ?? page);
        if (data.facets && typeof data.facets === "object") {
          facets = {
            categories: Array.isArray(data.facets.categories) ? data.facets.categories : [],
            priceBounds: {
              min: Number(data.facets.priceBounds?.min ?? 0),
              max: Number(data.facets.priceBounds?.max ?? 0),
            },
          };
        }
      } else {
        // Fallback for legacy bare-array responses
        products = Array.isArray(data) ? data : [];
        total = products.length;
      }
    } catch {
      products = [];
    }
  }
  const start = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(total, currentPage * PAGE_SIZE);
  const filterProps = {
    facets,
    selectedCategories: categoryList,
    selectedSubcategories: subcategoryList,
    minPrice: rawMinPrice,
    maxPrice: rawMaxPrice,
    inStock,
    sort,
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-serif text-3xl text-ink">All Products</h1>

      <Suspense>
        <ProductSearchInput initialValue={searchText} />
      </Suspense>

      <Suspense>
        <ProductFilterDrawer {...filterProps} />
      </Suspense>

      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
        <aside aria-label="Product filters" className="hidden lg:block">
          <div className="lg:sticky lg:top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-line bg-white p-5">
            <Suspense>
              <ProductFilters {...filterProps} />
            </Suspense>
          </div>
        </aside>

        <div className="min-w-0">
          {total > 0 ? (
            <p className="mb-4 text-sm text-brand font-semibold">
              Showing {start}–{end} of {total} products
            </p>
          ) : null}

          <ProductGrid
            products={products}
            showCategory
            emptyMessage={
              searchText
                ? `No products found for "${searchText}".`
                : "No products match the selected filters."
            }
          />
          {products.length === 0 ? (
            <p className="mt-4 text-center text-sm text-smoke">
              <Link href="/products" className="font-semibold text-brand hover:underline">
                Clear search and filters
              </Link>
            </p>
          ) : null}

          <Suspense>
            <PaginationControls page={currentPage} totalPages={totalPages} label="Products pagination" />
          </Suspense>
        </div>
      </div>
    </main>
  );
};

export default AllProductsPage;