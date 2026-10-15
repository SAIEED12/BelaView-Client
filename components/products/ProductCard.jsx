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

  return (
    <article className="group flex min-w-0 flex-col rounded-xl border border-line bg-white p-2.5 transition-shadow hover:shadow-lg sm:p-3 gap-1">
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
        <div className="absolute bottom-2 right-2 z-10 rounded-full bg-white/85 shadow-md backdrop-blur-sm ">
          <WishlistHeartButton productId={id} name={product.name} />
        </div>
      </div>

      <div className="flex flex-col gap-1 pt-2.5">
        {showCategory ? (
          <p className="truncate text-xs font-semibold text-fog">{cardLabel || "\u00A0"}</p>
        ) : null}
        <h2 className="text-sm min-h-[2.75em] font-semibold text-ink sm:text-sm">
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
          />
        </div>
      </div>
    </article>
  );
}

function formatLabel(value) {
  return String(value).replace(/-/g, " ");
}

export const ProductGrid = ({ products = [], showCategory = false, emptyMessage = "No products found." }) => {
  if (!products.length) {
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
