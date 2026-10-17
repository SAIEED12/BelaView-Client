import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { WishlistHeartButton } from "@/components/wishlist/WishlistHeartButton";

export default function ProductCard({ product, showCategory = false }) {
  const id = String(product?._id ?? product?.id ?? "");
  const categoryLabel = product?.category
    ? formatLabel(product.category)
    : "";
  const subcategoryLabel = product?.subcategory
    ? formatLabel(product.subcategory)
    : "";
  const cardLabel = subcategoryLabel || categoryLabel;
  const inStock = Number(product.stock ?? 1) > 0;

  return (
    <article className="group flex min-w-0 flex-col rounded-xl border border-line bg-sand-soft p-2.5 transition-shadow hover:shadow-lg sm:p-3 gap-1">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-mist ">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            unoptimized
            sizes="(max-width: 639px) 50vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {!inStock && (
          <span className="absolute top-2 left-2 z-10 rounded-md bg-red-400/80 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase shadow-sm">
            Out of Stock
          </span>
        )}
        <div className="absolute bottom-2 right-2 z-10 rounded-full bg-white/85 shadow-md backdrop-blur-sm ">
          <WishlistHeartButton productId={id} name={product.name} />
        </div>
      </div>

      <div className="flex flex-col gap-1 pt-2.5">
        {showCategory ? (
          <p className="truncate text-[12px]  font-semibold text-fog capitalize">{cardLabel || " "}</p>
        ) : null}
        <h2 className="text-sm line-clamp-1 font-bold text-ink sm:text-sm">
          {product.name}
        </h2>
        <span className="text-[17px] font-bold text-brand sm:text-sm mt-2">
          ৳{Number(product.price).toLocaleString()}
        </span>
        <div className="flex items-center gap-2 pt-0.5">
          <Link
            href={`/products/${id}`}
            className="flex h-7 flex-1 items-center justify-center rounded-lg bg-brand px-0.5 text-[11px] font-semibold tracking-normal text-white uppercase transition-colors hover:bg-brand-dark sm:px-2 sm:text-xs sm:tracking-[0.06em]"
          >
            View Details
          </Link>
          <AddToCartButton
            iconOnly
            productId={id}
            name={product.name}
            price={product.price}
            image={product.image || ""}
            stock={Number(product.stock ?? 1)}
            sizes={product.sizes}
          />
        </div>
      </div>
    </article>
  );
}

function formatLabel(value) {
  return String(value).replace(/-/g, " ");
}

export const ProductGrid = ({ products = [], showCategory = false, emptyMessage = "No products found.", emptyState = null }) => {
  if (!products.length) {
    if (emptyState) return emptyState;
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center">
        <p className="text-sm text-smoke">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-7 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={String(product?._id ?? product?.id ?? "")}
          product={product}
          showCategory={showCategory}
        />
      ))}
    </div>
  );
};
