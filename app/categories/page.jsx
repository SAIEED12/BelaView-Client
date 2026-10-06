import Image from "next/image";
import Link from "next/link";
import {
  categoryHref,
  getCategoryTree,
  subcategoryHref,
} from "@/lib/categories";

export const metadata = {
  title: "Categories | BelaView",
  description: "Browse products by category and sub-category.",
};

const AllCategoriesPage = async () => {
  const categories = await getCategoryTree();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-2 font-serif text-3xl text-ink">Categories</h1>
      <p className="mb-8 text-sm text-smoke font-semibold">
        {categories.length === 0
          ? "No categories yet."
          : `${categories.length} ${categories.length === 1 ? "category" : "categories"}`}
      </p>

      {categories.length === 0 ? (
        <p className="text-smoke">
          No categories found yet. Categories are created by the store owner.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {categories.map((parent) => (
            <section
              key={parent.slug}
              className="overflow-hidden rounded-2xl border border-line bg-white"
            >
              <div className="grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]">
                <Link
                  href={categoryHref(parent)}
                  className="group relative block bg-mist no-underline md:aspect-square"
                >
                  {parent.image ? (
                    <Image
                      src={parent.image}
                      alt={parent.name}
                      fill
                      unoptimized
                      sizes="(min-width: 768px) 220px, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : null}
                </Link>

                <div className="flex flex-col gap-3 p-6 md:p-8">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h2 className="font-serif text-2xl text-ink">
                      <Link
                        href={categoryHref(parent)}
                        className="text-ink no-underline hover:text-brand"
                      >
                        {parent.name}
                      </Link>
                    </h2>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-smoke">
                      {parent.productCount ?? 0}{" "}
                      {(parent.productCount ?? 0) === 1 ? "product" : "products"}
                    </p>
                  </div>

                  {parent.subcategories?.length > 0 ? (
                    <ul className="flex flex-wrap gap-2 pt-1">
                      {parent.subcategories.map((sub) => (
                        <li key={sub.slug}>
                          <Link
                            href={subcategoryHref(parent, sub)}
                            className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-ink no-underline transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand"
                          >
                            {sub.name}
                            <span className="text-[10px] font-semibold text-fog">
                              {sub.productCount ?? 0}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-smoke">
                      No sub-categories yet.
                    </p>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
};

export default AllCategoriesPage;