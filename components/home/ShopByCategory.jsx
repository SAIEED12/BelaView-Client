import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  buildCategoryStats,
  categoryHref,
  getCategoryTree,
  subcategoryHref,
} from "@/lib/categories";

export default async function ShopByCategory({ products = [], limit = 6 }) {
  const categories = await getCategoryTree();

  if (!categories.length) return null;

  const visible = categories.slice(0, limit);
  const stats = buildCategoryStats(categories, products);

  return (
    <section aria-label="Shop by category" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Categories
          </p>
          <h2 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-smoke">
            Find the perfect swing for your balcony, garden, or reading corner.
          </p>
        </div>
        <Link
          href="/categories"
          className="group inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:border-brand hover:text-brand"
        >
          View all
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((parent) => {
          const stat = stats.get(parent.slug) ?? {};
          const count = Number(stat.count ?? parent.productCount ?? 0);
          const subs = Array.isArray(parent.subcategories) ? parent.subcategories.slice(0, 4) : [];
          return (
            <div
              key={parent.slug}
              className="group relative overflow-hidden rounded-2xl bg-mist"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                {stat.coverImage ? (
                  <Image
                    src={stat.coverImage}
                    alt={parent.name}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              </div>

              {/* Whole-card link sits under the content so sub-category
                  links stay independently clickable. */}
              <Link
                href={categoryHref(parent)}
                className="absolute inset-0 z-0 no-underline"
                aria-label={parent.name}
              />

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 p-5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-xl text-white">{parent.name}</h3>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-white/70">
                      {count} {count === 1 ? "product" : "products"}
                      {Number.isFinite(stat.minPrice)
                        ? ` · from ৳${Number(stat.minPrice).toLocaleString()}`
                        : ""}
                    </p>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors group-hover:bg-brand">
                    <ArrowUpRight size={18} />
                  </span>
                </div>

                {subs.length > 0 ? (
                  <ul className="relative z-20 flex flex-wrap gap-1.5 pt-1">
                    {subs.map((sub) => (
                      <li key={sub.slug}>
                        <Link
                          href={subcategoryHref(parent, sub)}
                          className="pointer-events-auto inline-block rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white no-underline backdrop-blur-md transition-colors hover:bg-brand"
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}