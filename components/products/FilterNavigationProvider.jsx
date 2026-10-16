"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const FilterNavigationContext = createContext(null);

/**
 * Single place where every filter control commits URL changes. Wrapping the
 * navigation in `startTransition` lets React keep the current results on
 * screen while the server re-renders, and exposes `isPending` so the results
 * column can show a light updating state.
 */
export function FilterNavigationProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const searchParamsRef = useRef(searchParams?.toString() ?? "");

  useEffect(() => {
    searchParamsRef.current = searchParams?.toString() ?? "";
  }, [searchParams]);

  const navigate = useCallback(
    (mutate, { resetPage = true } = {}) => {
      const params = new URLSearchParams(searchParamsRef.current);
      mutate(params);
      // New filter selections always start at page 1
      if (resetPage) params.delete("page");
      const query = params.toString();
      const href = query ? `${pathname}?${query}` : pathname;
      startTransition(() => {
        router.replace(href, { scroll: false });
      });
    },
    [pathname, router, startTransition],
  );

  const value = useMemo(() => ({ navigate, isPending }), [navigate, isPending]);

  return (
    <FilterNavigationContext.Provider value={value}>
      {children}
    </FilterNavigationContext.Provider>
  );
}

export const useFilterNavigation = () => {
  const context = useContext(FilterNavigationContext);
  if (!context) {
    throw new Error(
      "useFilterNavigation must be used inside a FilterNavigationProvider",
    );
  }
  return context;
};
