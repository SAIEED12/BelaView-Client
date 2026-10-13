"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

const DEBOUNCE_MS = 150;

export function ProductSearchInput({
  initialValue = "",
  placeholder = "Search products by name or category...",
  className = "",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(
    () => initialValue || searchParams?.get("search") || ""
  );
  const timerRef = useRef(null);
  const lastCommittedRef = useRef(initialValue);
  const searchParamsRef = useRef(searchParams?.toString() ?? "");

  useEffect(() => {
    searchParamsRef.current = searchParams?.toString() ?? "";
  }, [searchParams]);

  // Sync only on external URL changes (back/forward), never while typing.
  useEffect(() => {
    if (initialValue !== lastCommittedRef.current) {
      lastCommittedRef.current = initialValue;
      setValue(initialValue);
    }
  }, [initialValue]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const commitSearch = (raw) => {
    const trimmed = String(raw ?? "").trim();
    lastCommittedRef.current = trimmed;
    // Used globally in the navbar: searches always run on /products.
    if (pathname !== "/products") {
      const params = new URLSearchParams();
      if (trimmed) params.set("search", trimmed);
      const query = params.toString();
      router.push(query ? `/products?${query}` : "/products");
      return;
    }
    const params = new URLSearchParams(searchParamsRef.current);
    if (trimmed) {
      params.set("search", trimmed);
    } else {
      params.delete("search");
    }
    // New queries always start at page 1
    params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const handleChange = (e) => {
    const next = e.target.value;
    setValue(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => commitSearch(next), DEBOUNCE_MS);
  };

  const handleClear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setValue("");
    commitSearch("");
  };

  return (
    <div role="search" className={`w-full ${className || "mb-6"}`.trim()}>
      <div className="relative w-full">
        <Search
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-smoke"
        />
        <input
          type="text"
          role="searchbox"
          aria-label="Search products"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete="off"
          inputMode="search"
          enterKeyHint="search"
          className="w-full rounded-xl border border-line bg-white py-2.5 pr-10 pl-10 text-sm text-ink outline-none placeholder:text-smoke focus:border-brand focus:ring-2 focus:ring-brand/20 sm:text-base [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
        />
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute top-1/2 right-3 inline-flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-smoke transition-colors hover:bg-mist hover:text-ink"
          >
            <X size={15} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
