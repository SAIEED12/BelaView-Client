import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PackageOpen,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Truck,
} from "lucide-react";

import ProductGallery from "@/components/ProductGallery";
import PurchasePanel from "@/components/PurchasePanel";
import RelatedProducts from "@/components/RelatedProducts";
import ViewContentTracker from "@/components/ViewContentTracker";
import { getVisiblePolicies } from "@/lib/productPolicies";

const SERVER_URL = process.env.SERVER_URL;

const TRUST_ITEMS = [
  { icon: Truck, title: "Cash on delivery", note: "Pay when it arrives" },
  { icon: ShieldCheck, title: "Warranty", note: "Covered against defects" },
  { icon: RotateCcw, title: "Easy returns", note: "Simple exchange" },
];

// Icons come from lucide sets already used elsewhere in the app.
const POLICY_ICONS = {
  disclaimer: ShieldAlert,
  note: PackageOpen,
  deliveryPayment: Truck,
  returnPolicy: RotateCcw,
};

const ProductsDetailsPage = async ({ params }) => {
  const { id } = await params;

  const [productRes, listRes] = await Promise.all([
    fetch(`${SERVER_URL}/products/${id}`, { cache: "no-store" }),
    fetch(`${SERVER_URL}/products`, { cache: "no-store" }).catch(() => null),
  ]);

  if (!productRes.ok) notFound();

  const product = await productRes.json();
  const allProducts = listRes?.ok ? await listRes.json() : [];

  // Related: same category, excluding this product, max 4
  const related = allProducts
    .filter(
      (p) =>
        product.category &&
        p.category === product.category &&
        String(p._id) !== String(product._id),
    )
    .slice(0, 4);

  // Image Gallery
  const images = (
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image]
  ).filter(Boolean);

  const price = Number(product.price);

  const stock = Number(product.stock) || 0;
  const stockBadge =
    stock === 0
      ? { label: "Out of stock", className: "bg-red-100 text-red-700" }
      : stock <= 1
        ? {
            label: `Only ${stock} left`,
            className: "bg-amber-100 text-amber-800",
          }
        : { label: "In stock", className: "bg-green-100 text-green-800" };

  const description =
    typeof product.description === "string" ? product.description.trim() : "";

  const policies = getVisiblePolicies(product);

  return (
    <main className="flex flex-col">
      <ViewContentTracker
        productId={String(product._id)}
        name={product.name}
        price={price}
      />
      {/* Breadcrumb */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-smoke">
            <li>
              <Link href="/" className="transition-colors hover:text-brand">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-fog">
              /
            </li>
            <li>
              <Link href="/products" className="transition-colors hover:text-brand">
                Products
              </Link>
            </li>
            <li aria-hidden="true" className="text-fog">
              /
            </li>
            <li
              aria-current="page"
              className="max-w-[14rem] truncate font-medium text-ink sm:max-w-xs"
            >
              {product.name}
            </li>
          </ol>
        </nav>
      </div>

      {/* Gallery (left) + info (right) */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start lg:gap-14">
          {/*  Gallery (left)  */}
          <div className="lg:sticky lg:top-24">
            <ProductGallery
              images={images}
              name={product.name}
              category={product.category}
            />
          </div>

          {/*  Info (right)  */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${stockBadge.className}`}
              >
                {stockBadge.label}
              </span>
            </div>

            <h1 className="font-serif text-2xl leading-tight text-ink sm:text-2xl font-semibold">
              {product.name}
            </h1>

            <p className="text-xl font-semibold text-brand sm:text-xl">
              ৳{price.toLocaleString()}
            </p>

            <PurchasePanel
              productId={String(product._id)}
              name={product.name}
              price={price}
              image={images[0] ?? ""}
              stock={stock}
            />

            {/* Trust row */}
            <ul className="grid grid-cols-3 gap-3 border-t border-line pt-6">
              {TRUST_ITEMS.map(({ icon: Icon, title, note }) => (
                <li
                  key={title}
                  className="flex flex-col items-center gap-1.5 text-center"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sand-soft text-[#79693e]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold text-ink">
                    {title}
                  </span>
                  <span className="text-xs text-smoke">{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Description + policies */}
      {description || policies.length > 0 ? (
        <section
          aria-label="Product information"
          className="border-y border-sand-line bg-sand-soft"
        >
          <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
            {description ? (
              <div className="rounded-3xl border border-sand-line bg-white p-6 sm:p-8">
                <h2 className="font-serif text-2xl text-ink sm:text-2xl font-semibold">
                  Description
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-relaxed whitespace-pre-line text-smoke">
                  {description}
                </p>
              </div>
            ) : null}

            {policies.length > 0 ? (
              <div
                className={`grid gap-4 sm:grid-cols-2 ${
                  description ? "mt-6 sm:mt-8" : ""
                }`}
              >
                {policies.map((policy) => {
                  const Icon = POLICY_ICONS[policy.field];
                  return (
                    <div
                      key={policy.field}
                      className="rounded-2xl border border-sand-line bg-white p-5 sm:p-6"
                    >
                      <h3 className="flex items-center gap-2.5 text-xs font-bold text-ink uppercase">
                        {Icon ? (
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand"
                            aria-hidden="true"
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                        ) : null}
                        {policy.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-smoke">
                        {policy.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Related products */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <RelatedProducts products={related} />
      </div>
    </main>
  );
};

export default ProductsDetailsPage;
