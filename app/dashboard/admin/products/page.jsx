import { Suspense } from "react";
import { AddProductModal } from "@/components/dashboard/AddProductModal";
import { ProductTable } from "@/components/dashboard/ProductTable";
import { ProductSearchInput } from "@/components/products/ProductSearchInput";
import { getAdminProducts } from "@/lib/actions/products";
import { getCategories } from "@/lib/actions/categories";

const PAGE_SIZE = 20;

const AdminProductsPage = async ({ searchParams }) => {
  const query = await searchParams;
  const rawSearch =
    typeof query?.search === "string"
      ? query.search
      : Array.isArray(query?.search)
        ? (query.search[0] ?? "")
        : "";
  const rawPage = Array.isArray(query?.page) ? query.page[0] : query?.page;
  const parsedPage = Number.parseInt(rawPage, 10);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const searchText = rawSearch.trim();
  let result = { products: [], total: 0, page, limit: PAGE_SIZE, totalPages: 1 };
  try {
    const data = await getAdminProducts(searchText, { page, limit: PAGE_SIZE });
    if (data && typeof data === "object" && !Array.isArray(data)) {
      result = data;
    } else {
      result.products = Array.isArray(data) ? data : [];
      result.total = result.products.length;
    }
  } catch {
    result = { products: [], total: 0, page, limit: PAGE_SIZE, totalPages: 1 };
  }
  const list = Array.isArray(result.products) ? result.products : [];
  const { categories } = await getCategories();
  return (
    <div>
      <div className="flex justify-between items-center my-5">
        <h1 className="truncate font-serif text-xl text-ink md:text-3xl">Products</h1>
        <AddProductModal categories={categories} />
      </div>
      <Suspense>
        <ProductSearchInput
          initialValue={searchText}
          placeholder="Search products by name, category, or price..."
        />
      </Suspense>
      {list.length === 0 && searchText ? (
        <p className="mb-4 text-sm text-smoke">
          No products found for &ldquo;{searchText}&rdquo;.
        </p>
      ) : null}
      <ProductTable
        products={list}
        total={result.total}
        page={result.page}
        limit={result.limit}
        totalPages={result.totalPages}
        categories={categories}
      />
    </div>
  );
};

export default AdminProductsPage;
