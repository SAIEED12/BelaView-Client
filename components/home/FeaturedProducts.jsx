import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";

export default function FeaturedProducts({ products = [] }) {
  const items = useMemo(() => {
    const list = Array.isArray(products) ? [...products] : [];
    // Newest first
    list.sort((a, b) => String(b?._id ?? "").localeCompare(String(a?._id ?? "")));
    return list.slice(0, 8);
  }, [products]);

  if (!products.length) return null;

  return (
    <section aria-label="Featured products" className="w-full bg-sand">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Handpicked
            </p>
            <h2 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">
              New Arrivals
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-smoke">
              Fresh off the loom — our latest pieces, woven for comfort.
            </p>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-brand"
          >
            Shop all
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((product) => (
            <ProductCard
              key={String(product._id)}
              product={product}
              showCategory
            />
          ))}
        </div>
      </div>
    </section>
  );
}
