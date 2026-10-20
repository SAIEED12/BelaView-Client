import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CategoryCarousel from "./CategoryCarousel";
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
  const items = visible.map((parent) => {
    const stat = stats.get(parent.slug) ?? {};
    const subs = Array.isArray(parent.subcategories) ? parent.subcategories.slice(0, 4) : [];
    return {
      slug: parent.slug,
      name: parent.name,
      href: categoryHref(parent),
      count: Number(stat.count ?? parent.productCount ?? 0),
      coverImage: stat.coverImage || "",
      minPrice: Number(stat.minPrice),
      subs: subs.map((sub) => ({
        slug: sub.slug,
        name: sub.name,
        href: subcategoryHref(parent, sub),
      })),
    };
  });

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
          className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-brand"
        >
          View all
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <CategoryCarousel items={items} />
    </section>
  );  
}