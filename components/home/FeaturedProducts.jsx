import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { WishlistHeartButton } from "@/components/wishlist/WishlistHeartButton";

export default function FeaturedProducts({ products = [] }) {
  const items = useMemo(() => {
    const list = Array.isArray(products) ? [...products] : [];
    // Newest first — ObjectId strings are roughly time-ordered.
    list.sort((a, b) => String(b?._id ?? "").localeCompare(String(a?._id ?? "")));
    return list.slice(0, 8);
  }, [products]);

  if (!products.length) return null;

  return (
    <section aria-label="Featured products" className="w-full bg-mist/60">
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
            <article
              key={String(product._id)}
              className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-mist">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    unoptimized
                    sizes="(max-width: 639px) 50vw, (min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-6">
                {product.category ? (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fog">
                    {String(product.category).replace(/-/g, " ")}
                  </p>
                ) : null}
                <h3 className="line-clamp-2 text-sm font-semibold break-words text-ink sm:text-base">{product.name}</h3>
                <div className="mt-auto flex items-center justify-between gap-2 pt-1 sm:gap-3 sm:pt-2">
                  <span className="text-lg font-semibold text-brand sm:text-xl">
                    ৳{Number(product.price).toLocaleString()}
                  </span>
                  <WishlistHeartButton productId={String(product._id)} name={product.name} />
                </div>
                <Link
                  href={`/products/${product._id}`}
                  className="block w-full rounded-full bg-brand px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-brand-dark"
                >
                  View Details
                </Link>
                <AddToCartButton
                  productId={String(product._id)}
                  name={product.name}
                  price={product.price}
                  image={product.image || ""}
                  stock={Number(product.stock ?? 1)}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
