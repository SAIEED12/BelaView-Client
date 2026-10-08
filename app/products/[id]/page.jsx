import Link from "next/link";
import { notFound } from "next/navigation";
import { RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";

import ProductGallery from "@/components/ProductGallery";
import PurchasePanel from "@/components/PurchasePanel";
import RelatedProducts from "@/components/RelatedProducts";
import ProductTabs from "@/components/ProductTabs";
import { getVisiblePolicies } from "@/lib/productPolicies";
const SERVER_URL = process.env.SERVER_URL;

const TRUST_ITEMS = [
  { icon: Truck, title: "Cash on delivery", note: "Pay when it arrives" },
  { icon: ShieldCheck, title: "Warranty", note: "Covered against defects" },
  { icon: RotateCcw, title: "Easy returns", note: "Simple exchange" },
];

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

const materials = Array.isArray(product.materials)
  ? product.materials.filter(Boolean)
  : product.materials;

const tabs = [
  { title: "Description", content: product.description },
  {
    title: "Materials",
    content: Array.isArray(materials)
      ? materials.length > 0 && (
          <ul className="list-disc space-y-1.5 pl-5">
            {materials.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )
      : materials,
  },
].filter((tab) => tab.content);

  const policies = getVisiblePolicies(product);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/products"
        className="mb-6 inline-block text-sm text-smoke transition-colors hover:text-brand"
      >
        ← Back to all products
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start lg:gap-14">
        {/*  Gallery (left)  */}
        <div className="lg:sticky lg:top-24">
          <ProductGallery
            images={images}
            name={product.name}
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

          <h1 className="font-serif text-4xl leading-tight text-ink sm:text-5xl">
            {product.name}
          </h1>

          <h1 className="font-serif leading-tight text-smoke sm:text-sm">
            CATEGORY: {product.category && (
              <span className=" font-semibold uppercase text-smoke]">
                {product.category.replace("-", " ")}
              </span>
            )}
          </h1>

          <h1 className="text-4xl font-semibold text-brand">
            ৳{price.toLocaleString()}
          </h1>

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
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand">
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

      {/* Tabs */}
      <ProductTabs tabs={tabs} />

      {/* Optional policy sections — only rendered when the admin filled them */}
      {policies.length > 0 ? (
        <section aria-label="Product policies" className="mt-10 grid gap-4">
          {policies.map((policy) => (
            <div
              key={policy.field}
              className="rounded-2xl border border-line bg-white p-5 sm:p-6"
            >
              <h2 className="text-sm font-semibold tracking-wide text-ink uppercase">
                {policy.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-smoke">
                {policy.content}
              </p>
            </div>
          ))}
        </section>
      ) : null}

      {/* Related products */}
      <RelatedProducts products={related} />
    </main>
  );
};

export default ProductsDetailsPage;
