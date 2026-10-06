export const slugifyCategory = (name) => {
  const raw = String(name ?? "").trim().toLowerCase();
  if (!raw) return "uncategorized";
  const slug = raw
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u0980-\u09FF-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "uncategorized";
};

export const formatCategoryName = (name) => {
  const raw = String(name ?? "").trim();
  if (!raw) return "Uncategorized";
  return raw.replace(/-/g, " ");
};

export const groupProductsByCategory = (products) => {
  const list = Array.isArray(products) ? products : [];
  const map = new Map();

  for (const product of list) {
    const name =
      product?.category && String(product.category).trim()
        ? String(product.category).trim()
        : "Uncategorized";
    const slug = slugifyCategory(name);
    const price = Number(product?.price);
    const entry = map.get(slug) ?? {
      slug,
      name,
      count: 0,
      coverImage: null,
      minPrice: null,
    };
    // Prefer the first-seen display name (preserves original casing)
    entry.count += 1;
    if (!entry.coverImage && product?.image) entry.coverImage = product.image;
    if (Number.isFinite(price)) {
      entry.minPrice =
        entry.minPrice === null ? price : Math.min(entry.minPrice, price);
    }
    map.set(slug, entry);
  }

  return [...map.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  );
};

export const findParentBySlug = (categories, slug) => {
  const target = String(slug ?? "").trim().toLowerCase();
  if (!target) return null;
  const list = Array.isArray(categories) ? categories : [];
  return (
    list.find((c) => String(c?.slug ?? "").toLowerCase() === target) ?? null
  );
};

export const findSubcategoryBySlug = (parent, slug) => {
  const target = String(slug ?? "").trim().toLowerCase();
  if (!target) return null;
  const list = Array.isArray(parent?.subcategories) ? parent.subcategories : [];
  return list.find((s) => String(s?.slug ?? "").toLowerCase() === target) ?? null;
};

export const categoryHref = (parent) => `/categories/${parent?.slug ?? ""}`;

export const subcategoryHref = (parent, sub) =>
  `/categories/${parent?.slug ?? ""}/${sub?.slug ?? ""}`;

// Flattens the tree into checkbox-friendly rows used by the product filters.
export const buildCategoryFilterRows = (facets = []) => {
  const rows = [];
  for (const parent of Array.isArray(facets) ? facets : []) {
    const parentSlug = String(parent?.slug ?? "");
    if (!parentSlug) continue;
    rows.push({
      level: "parent",
      slug: parentSlug,
      name: String(parent?.name ?? parentSlug),
      count: Number(parent?.count ?? 0),
    });
    for (const sub of Array.isArray(parent?.subcategories) ? parent.subcategories : []) {
      const subSlug = String(sub?.slug ?? "");
      if (!subSlug) continue;
      rows.push({
        level: "sub",
        parentSlug,
        slug: subSlug,
        name: String(sub?.name ?? subSlug),
        count: Number(sub?.count ?? 0),
      });
    }
  }
  return rows;
};

const treeFromFacets = (facets = []) =>
  (Array.isArray(facets) ? facets : [])
    .filter((entry) => String(entry?.slug ?? "").trim())
    .map((entry) => ({
      _id: "",
      name: String(entry?.name ?? entry?.slug ?? ""),
      slug: String(entry.slug),
      image: null,
      productCount: Number(entry?.count ?? 0),
      subcategories: (Array.isArray(entry?.subcategories) ? entry.subcategories : [])
        .filter((sub) => String(sub?.slug ?? "").trim())
        .map((sub) => ({
          _id: "",
          name: String(sub?.name ?? sub?.slug ?? ""),
          slug: String(sub.slug),
          image: null,
          productCount: Number(sub?.count ?? 0),
        })),
    }));

const treeFromProducts = (products) =>
  groupProductsByCategory(products).map((group) => ({
    _id: "",
    name: formatCategoryName(group.name),
    slug: group.slug,
    image: group.coverImage || null,
    productCount: group.count,
    minPrice: group.minPrice,
    subcategories: [],
  }));

/**
 * Categories now live in the backend `categories` collection. Until an admin has
 * created some, fall back to deriving a flat list from existing products so the
 * storefront never renders empty.
 */
export const getCategoryTree = async ({ fresh = false } = {}) => {
  const serverUrl = process.env.SERVER_URL;
  const init = fresh ? { cache: "no-store" } : { next: { revalidate: 300 } };

  try {
    const response = await fetch(`${serverUrl}/categories`, init);
    if (response.ok) {
      const data = await response.json();
      const list = Array.isArray(data) ? data : data?.categories;
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch {
    // fall through to the product-derived fallback
  }

  try {
    const response = await fetch(`${serverUrl}/products?page=1&limit=1`, init);
    if (response.ok) {
      const data = await response.json();
      if (data && typeof data === "object" && !Array.isArray(data)) {
        const facets = Array.isArray(data.facets?.categories) ? data.facets.categories : [];
        if (facets.length > 0) return treeFromFacets(facets);
      }
    }
  } catch {
    // ignore
  }

  return [];
};

/**
 * Cover image + cheapest price per category for the storefront cards. Uses one
 * products request and matches on slug so it works for both the categories
 * collection and the product-derived fallback.
 */
export const buildCategoryStats = (categories, products) => {
  const list = Array.isArray(products) ? products : [];
  const stats = new Map();

  for (const parent of Array.isArray(categories) ? categories : []) {
    stats.set(parent.slug, {
      minPrice: null,
      coverImage: parent.image || null,
      count: Number(parent.productCount ?? 0),
    });
  }

  for (const product of list) {
    const slug = slugifyCategory(product?.category ?? "");
    const entry = stats.get(slug);
    if (!entry) continue;
    const price = Number(product?.price);
    if (Number.isFinite(price)) {
      entry.minPrice =
        entry.minPrice === null ? price : Math.min(entry.minPrice, price);
    }
    if (!entry.coverImage && product?.image) {
      entry.coverImage = product.image;
    }
  }

  // Counts from the tree are authoritative; only trust "from ৳X" when the
  // sampled products cover every product in the category.
  for (const parent of Array.isArray(categories) ? categories : []) {
    const entry = stats.get(parent.slug);
    if (entry && entry.count > list.length) {
      entry.minPrice = null;
    }
  }

  return stats;
};