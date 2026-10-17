"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackMetaEvent } from "@/lib/meta-pixel";

// Re-fires PageView on App Router client-side navigations.
// The initial PageView comes from the base snippet in app/layout.js, so the
// first effect run (mount) is skipped to avoid duplicates.
export default function MetaPixelPageView() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    trackMetaEvent("PageView");
  }, [pathname]);

  return null;
}
