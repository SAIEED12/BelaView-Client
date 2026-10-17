"use client";

import { useEffect, useRef } from "react";
import { sendMetaEvent } from "@/lib/meta-pixel";

// Fires a single ViewContent when a product detail page mounts.
export default function ViewContentTracker({ productId, name, price }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    sendMetaEvent("ViewContent", {
      content_ids: [String(productId)],
      content_type: "product",
      content_name: name,
      value: Number(price) || 0,
      currency: "BDT",
    });
  }, [productId, name, price]);

  return null;
}
