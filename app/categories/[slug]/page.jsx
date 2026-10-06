import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductGrid } from "@/components/products/ProductCard";
import { PaginationControls } from "@/components/PaginationControls";
import {
  findParentBySlug,
  getCategoryTree,
  subcategoryHref,
} from "@/lib/categories";

const SERVER_URL = process.env.SERVER_URL;
const PAGE_SIZE = 20;

export const generateMetadata = async ({ params }) => {
  const { slug } = await params;
  const categories = await getCategoryTree();
  const parent = findParentBySlug(categories, slug);
  if (!parent) return { title: "Category not found | BelaView" };
  return {
    title: `${parent.name} | BelaView`,
    description: `Browse ${parent.name} products and sub-categories.`,
  };
};

const fetchCategoryProducts = async (categorySlug, page) => {
  try {
    const params = new URLSearchParams({
      category: categorySlug,
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    const response = await fetch(`${SERVER_URL}/products?${params.toString()}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return { products: [], total: 0, totalPages: 1, page };
    }
    const data = await response.json();
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return {
        products: Array.isArray(data.products) ? data.products : [],
        total: Number(data.total ?? 0),
        totalPages: Math.max(1, Number(data.totalPages ?? 1)),
        page: Number(data.page ?? page),
      };
    }
    const list = Array.isArray(data) ? data : [];
    return { products: list, total: list.length, totalPages: 1, page };
  } catch {
    return { products: [], total: 0, totalPages: 1, page };
  }
};

const CategoryPage = async ({ params, searchParams }) => {
  const { slug } = await params;
  const query = (await searchParams) ?? {};
  const rawPage = Array.isArray(query.page) ? query.page[0] : query.page;
  const parsed = Number.parseInt(rawPage, 10);
  const page = Number.isInteger(parsed) && parsed > 0 ? parsed : 1;

  const categories = await getCategoryTree();
  const parent = findParentBySlug(categories, slug);
  if (!parent) notFound();

  const { products, total, totalPages, page: currentPage } =
    await fetchCategoryProducts(parent.slug, page);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-smoke">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="text-ink no-underline hover:text-brand">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/categories" className="text-ink no-underline hover:text-brand">
              Categories
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-brand">
            {parent.name}
          </li>
        </ol>
      </nav>

      <h1 className="font-serif text-3xl text-ink sm:text-4xl">{parent.name}</h1>
      <p className="mt-2 text-sm text-smoke">
        {total} {total === 1 ? "product" : "products"}
      </p>

      {parent.subcategories?.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
            Sub-categories
          </h2>
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {parent.subcategories.map((sub) => (
              <li key={sub.slug}>
                <Link
                  href={subcategoryHref(parent, sub)}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3.5 text-sm font-semibold text-ink no-underline transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand"
                >
                  <span className="truncate">{sub.name}</span>
                  <span className="shrink-0 text-xs font-semibold text-fog">
                    {sub.productCount ?? 0}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink">
          Products
        </h2>
        <ProductGrid
          products={products}
          showCategory={false}
          emptyMessage={`No products in ${parent.name} yet.`}
        />
      </div>

      <Suspense>
        <PaginationControls
          page={currentPage}
          totalPages={totalPages}
          label={`${parent.name} pagination`}
        />
      </Suspense>
    </main>
  );
};

export default CategoryPage;