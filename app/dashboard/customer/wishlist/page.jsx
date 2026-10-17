import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getWishlist } from "@/lib/actions/wishlist";
import { getCheckoutProduct } from "@/lib/actions/orders";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { WishlistRemoveButton } from "@/components/wishlist/WishlistRemoveButton";

export const metadata = {
  title: "Wishlist | My Account",
  description: "Your saved wishlist items.",
};

const CustomerWishlistPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login?redirect=/dashboard/customer/wishlist");
  }

  let ids = [];
  let loadError = "";

  try {
    ids = await getWishlist();
  } catch (err) {
    loadError = err?.message || "Failed to fetch wishlist";
  }

  const list = Array.isArray(ids) ? ids : [];
  const enriched = await Promise.all(
    list.map(async (id) => {
      try {
        const product = await getCheckoutProduct(id);
        return product || null;
      } catch {
        return null;
      }
    })
  );
  const items = enriched.filter(Boolean);

  return (
    <div>
      <div className="my-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="truncate font-serif text-xl text-ink md:text-3xl">
          My Wishlist
        </h1>
        <span className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-smoke">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      {loadError ? (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}. Please refresh to try again.
        </p>
      ) : null}

      {items.length === 0 && !loadError ? (
        <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center">
          <p className="text-sm text-smoke">
            Your wishlist is empty. Tap the heart on any product to save it here.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-6 py-2.5 text-xs font-semibold tracking-[0.12em] text-white no-underline transition-colors hover:bg-brand-dark"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {items.map((product) => {
            const id = String(product._id);
            return (
              <article
                key={id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-mist">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h2 className="line-clamp-1 text-base font-semibold text-ink">
                    {product.name}
                  </h2>
                  <span className="text-xl font-semibold text-brand">
                    ৳{Number(product.price).toLocaleString()}
                  </span>
                  <div className="mt-auto flex flex-col gap-2 pt-2">
                    <AddToCartButton
                      productId={id}
                      name={product.name}
                      price={product.price}
                      image={product.image || ""}
                      stock={Number(product.stock ?? 1)}
                      sizes={product.sizes}
                    />
                    <Link
                      href={`/products/${id}`}
                      className="block w-full rounded-full bg-brand px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-brand-dark"
                    >
                      View Details
                    </Link>
                    <WishlistRemoveButton productId={id} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerWishlistPage;
