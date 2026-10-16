"use client";

import { Loader2 } from "lucide-react";
import { useFilterNavigation } from "./FilterNavigationProvider";

export function PendingResults({ children }) {
  const { isPending } = useFilterNavigation();

  return (
    <div aria-busy={isPending} className="relative">
      {isPending ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center">
          <span
            role="status"
            className="mt-2 inline-flex items-center gap-2 rounded-full border border-line bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-brand shadow-md"
          >
            <Loader2 size={14} aria-hidden="true" className="animate-spin" />
            Updating results…
          </span>
        </div>
      ) : null}
      <div
        className={`transition-opacity duration-200 ${
          isPending ? "pointer-events-none opacity-50" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
