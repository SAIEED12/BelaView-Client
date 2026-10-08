export const POLICY_FIELDS = [
  "disclaimer",
  "note",
  "deliveryPayment",
  "returnPolicy",
];

export const POLICY_LABELS = {
  disclaimer: "Disclaimer",
  note: "Note",
  deliveryPayment: "Delivery and Payment",
  returnPolicy: "Return Policy",
};

export const DEFAULT_POLICIES = {
  disclaimer:
    "The pictures are clicked in daylight. Colour may vary slightly from the image due to the screen brightness.",
  note: "Every product is made in your choice of size and color.",
  deliveryPayment:
    "20% price should be paid while confirming the order. Home delivery will be done all over Bangladesh. The remaining amount should be paid to the courier.",
  returnPolicy:
    "Read the details carefully before ordering. Open the product in front of the delivery person. Cracks or similar problems should be reported to us immediately and returned immediately. The product will be shipped back to you shortly. There will be no returns just because you don't like it or don't need it now because the product is made just for you.",
};

export const getPolicyValue = (product, field, defaults = {}) => {
  const saved = product?.[field];
  if (typeof saved === "string" && saved.trim()) return saved;
  const fallback = defaults?.[field];
  return typeof fallback === "string" ? fallback : "";
};

export const getVisiblePolicies = (product) =>
  POLICY_FIELDS.map((field) => ({
    field,
    title: POLICY_LABELS[field] ?? field,
    content: typeof product?.[field] === "string" ? product[field].trim() : "",
  })).filter((entry) => entry.content);
