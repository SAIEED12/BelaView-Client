// Product URLs use the stored name-slug (e.g. /products/premium-black-metal-swing-bed).
// Responses from an older API may not have a slug yet, so every helper falls
// back to the legacy hex id — the API resolves either form.
const pickKey = (id, slug) =>
  String(slug ?? "").trim() || String(id ?? "").trim();

export const productHrefFrom = (id, slug = "") => {
  const key = pickKey(id, slug);
  return key ? `/products/${encodeURIComponent(key)}` : "/products";
};

export const productHref = (product) =>
  productHrefFrom(
    product?._id ?? product?.id ?? "",
    product?.slug ?? "",
  );
