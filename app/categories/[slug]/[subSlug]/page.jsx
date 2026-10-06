import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductGrid } from "@/components/products/ProductCard";
import { PaginationControls } from "@/components/PaginationControls";
import {
  categoryHref,
  findParentBySlug,
  findSubcategoryBySlug,
  getCategoryTree,
  subcategoryHref,
} from "@/lib/categories";

const SERVER_URL = process.env.SERVER_URL;
const PAGE_SIZE = 20;

export const generateMetadata = async ({ params }) => {
  const { slug, subSlug } = await params;
  const categories = await getCategoryTree();
  const parent = findParentBySlug(categories, slug);
  const sub = parent ? findSubcategoryBySlug(parent, subSlug) : null;
  if (!parent || !sub) return { title: "Sub-category not found | BelaView" };
  return {
    title: `${sub.name} · ${parent.name} | BelaView`,
    description: `Browse ${sub.name} products.`,
  };
};

const fetchSubcategoryProducts = async (categorySlug, subSlug, page) => {
  try {
    const params = new URLSearchParams({
      category: categorySlug,
      subcategory: subSlug,
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

const SubcategoryPage = async ({ params, searchParams }) => {
  const { slug, subSlug } = await params;
  const query = (await searchParams) ?? {};
  const rawPage = Array.isArray(query.page) ? query.page[0] : query.page;
  const parsed = Number.parseInt(rawPage, 10);
  const page = Number.isInteger(parsed) && parsed > 0 ? parsed : 1;

  const categories = await getCategoryTree();
  const parent = findParentBySlug(categories, slug);
  if (!parent) notFound();
  const sub = findSubcategoryBySlug(parent, subSlug);
  if (!sub) notFound();

  const { products, total, totalPages, page: currentPage } =
    await fetchSubcategoryProducts(parent.slug, sub.slug, page);

  const siblings = parent.subcategories.filter((entry) => entry.slug !== sub.slug);

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
          <li>
            <Link
              href={categoryHref(parent)}
              className="text-ink no-underline hover:text-brand"
            >
              {parent.name}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-brand">
            {sub.name}
          </li>
        </ol>
      </nav>

      <h1 className="font-serif text-3xl text-ink sm:text-4xl">{sub.name}</h1>
      <p className="mt-2 text-sm text-smoke">
        {total} {total === 1 ? "product" : "products"} in {parent.name}
      </p>

      {siblings.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
            More in {parent.name}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {siblings.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={subcategoryHref(parent, entry)}
                  className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-ink no-underline transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand"
                >
                  {entry.name}
                  <span className="text-[10px] font-semibold text-fog">
                    {entry.productCount ?? 0}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-10">
        <ProductGrid
          products={products}
          showCategory={false}
          emptyMessage={`No products in ${sub.name} yet.`}
        />
      </div>

      <Suspense>
        <PaginationControls
          page={currentPage}
          totalPages={totalPages}
          label={`${sub.name} pagination`}
        />
      </Suspense>
    </main>
  );
};

export default SubcategoryPage;