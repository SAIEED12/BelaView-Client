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
import {
  categoryHref,
  findParentBySlug,
  findSubcategoryBySlug,
  formatCategoryName,
  getCategoryTree,
  slugifyCategory,
  subcategoryHref,
} from "@/lib/categories";
import { getVisiblePolicies } from "@/lib/productPolicies";
import { getProductSizes } from "@/lib/product-sizes";

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

// The products listing reads the same params, so it can absorb links for legacy
// category values that are no longer linked to a category record.
const productFilterHref = (category, subcategory) => {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (subcategory) params.set("subcategory", subcategory);
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
};

const ProductsDetailsPage = async ({ params }) => {
  const { id } = await params;

  const [productRes, listRes, categoryTree] = await Promise.all([
    fetch(`${SERVER_URL}/products/${id}`, { cache: "no-store" }),
    fetch(`${SERVER_URL}/products`, { cache: "no-store" }).catch(() => null),
    getCategoryTree().catch(() => []),
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
      ? {
          label: "Out of stock",
          dot: "bg-red-500",
          className: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
        }
      : stock <= 1
        ? {
            label: `Only ${stock} left`,
            dot: "bg-amber-500",
            className: "bg-amber-50 text-amber-800 ring-1 ring-amber-600/20",
          }
        : {
            label: "In stock",
            dot: "bg-emerald-500",
            className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
          };

  // Category trail shown under the actions — products store category slugs, so
  // resolve the display names and links against the category tree.
  const categorySlug = String(product.category ?? "").trim();
  const subcategorySlug = String(product.subcategory ?? "").trim();
  const parentCategory = findParentBySlug(categoryTree, categorySlug);
  const childCategory = parentCategory
    ? findSubcategoryBySlug(parentCategory, subcategorySlug)
    : null;

  const categoryLinks = [];
  if (categorySlug) {
    categoryLinks.push({
      label: parentCategory?.name || formatCategoryName(categorySlug),
      href: parentCategory
        ? categoryHref(parentCategory)
        : productFilterHref(slugifyCategory(categorySlug), ""),
    });
  }
  if (subcategorySlug) {
    categoryLinks.push({
      label: childCategory?.name || formatCategoryName(subcategorySlug),
      href:
        parentCategory && childCategory
          ? subcategoryHref(parentCategory, childCategory)
          : productFilterHref(
              slugifyCategory(categorySlug),
              slugifyCategory(subcategorySlug),
            ),
    });
  }

  const description =
    typeof product.description === "string" ? product.description.trim() : "";

  const policies = getVisiblePolicies(product);

  const sizes = getProductSizes(product);

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
            <ProductGallery images={images} name={product.name} />
          </div>

          {/*  Info (right)  */}
          <div className="flex flex-col gap-5 rounded-[28px] border border-sand-line bg-sand-soft p-5 sm:p-6 lg:sticky lg:top-24">
            <div className="flex flex-col gap-3">
              <h1 className="text-2xl leading-[1.15] font-semibold text-ink">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xl font-semibold text-brand">
                  <span className="text-lg sm:text-xl">৳</span>
                  {price.toLocaleString()}
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${stockBadge.className}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${stockBadge.dot}`}
                    aria-hidden="true"
                  />
                  {stockBadge.label}
                </span>
              </div>
            </div>

            <PurchasePanel
              key={String(product._id)}
              productId={String(product._id)}
              name={product.name}
              price={price}
              image={images[0] ?? ""}
              stock={stock}
              sizes={sizes}
            />

            {/* Categories — same spot as the reference, right under the actions */}
            {categoryLinks.length > 0 ? (
              <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 border-t border-sand-line pt-4 text-sm">
                <span className="font-semibold text-ink">Categories:</span>
                {categoryLinks.map((entry, index) => (
                  <Link
                    key={entry.href}
                    href={entry.href}
                    className="text-smoke transition-colors hover:text-brand"
                  >
                    {entry.label}
                    {index < categoryLinks.length - 1 ? "," : ""}
                  </Link>
                ))}
              </div>
            ) : null}

            {/* Trust row */}
            <ul className="grid grid-cols-1 divide-y divide-sand-line border-t border-sand-line pt-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:pt-6">
              {TRUST_ITEMS.map(({ icon: Icon, title, note }) => (
                <li
                  key={title}
                  className="flex items-center gap-3 py-3 text-left first:pt-0 last:pb-0 sm:flex-col sm:items-center sm:gap-1.5 sm:px-3 sm:py-0 sm:text-center"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sand-line bg-white text-[#6b5b33]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="flex flex-col sm:items-center">
                    <span className="text-xs font-semibold text-ink">
                      {title}
                    </span>
                    <span className="text-xs text-smoke">{note}</span>
                  </span>
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
                <h2 className="font-serif text-md text-ink font-semibold">
                  Description
                </h2>
                <p className="mt-4 max-w-3xl text-base whitespace-pre-line text-smoke">
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
