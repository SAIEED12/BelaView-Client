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

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-lg">
      <div className="relative aspect-square w-full overflow-hidden bg-mist">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            unoptimized
            sizes="(max-width: 639px) 50vw, (min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-8">
        <h2 className=" text-sm font-semibold stext-ink sm:text-lg">{product.name}</h2>
        {showCategory && (categoryLabel || subcategoryLabel) ? (
          <p className="text-sm text-smoke">
            <span className="mr-1.5 text-xs font-semibold ">
               {categoryLabel}
            </span>
            {subcategoryLabel ? (
              <span className="mr-1.5 text-xs font-semibold ">
                · {subcategoryLabel}
              </span>
            ) : null}
          </p>
        ) : null}

        <div className="mt-auto flex flex-row items-center justify-between gap-2 pt-2 sm:gap-3 sm:pt-3">
          <span className="text-lg font-semibold text-brand sm:text-xl">
            ৳{Number(product.price).toLocaleString()}
          </span>
          <WishlistHeartButton productId={id} name={product.name} />
        </div>
        <Link
          href={`/products/${id}`}
          className="block w-full rounded-lg bg-brand px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-brand-dark sm:w-auto sm:py-2"
        >
          View Details
        </Link>
        <AddToCartButton
          productId={id}
          name={product.name}
          price={product.price}
          image={product.image || ""}
          stock={Number(product.stock ?? 1)}
        />
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 2xl:grid-cols-4">
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