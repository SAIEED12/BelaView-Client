// Cart lines are unique per product AND size, so different sizes of the same
// product stay separate rows. Size-less products keep the bare productId so
// existing carts and URLs behave exactly as before.

export const cartLineKey = (productId, size) => {
  const id = String(productId ?? "").trim();
  const safeSize = typeof size === "string" ? size.trim() : "";
  return safeSize ? `${id}::${safeSize}` : id;
};

export const parseCartLineKey = (key) => {
  const raw = String(key ?? "");
  const index = raw.indexOf("::");
  if (index === -1) return { productId: raw, size: "" };
  return { productId: raw.slice(0, index), size: raw.slice(index + 2) };
};
