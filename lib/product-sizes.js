// Helpers for the optional per-product size list (e.g. ["30", "32", "S"]).
// Mirrors the server-side normalizeSizes so both apps agree on the shape.

export const MAX_SIZES = 30;
export const MAX_SIZE_LEN = 16;

// Safe read for the storefront: always returns an array of clean strings.
export const getProductSizes = (product) => {
  const raw = product?.sizes;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);
};

// Admin input ("30, 32, 34") or an existing array -> clean array.
export const parseSizesInput = (value) => {
  const list = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  const seen = new Set();
  const sizes = [];
  for (const entry of list) {
    const token = String(entry ?? "").trim();
    if (!token || token.length > MAX_SIZE_LEN || token.includes(":")) continue;
    if (seen.has(token)) continue;
    seen.add(token);
    sizes.push(token);
    if (sizes.length >= MAX_SIZES) break;
  }
  return sizes;
};

// Stored array -> the single-line value shown in the edit form.
export const formatSizesInput = (sizes) => {
  const list = Array.isArray(sizes)
    ? sizes.filter((entry) => typeof entry === "string" && entry.trim())
    : [];
  return list.join(", ");
};
