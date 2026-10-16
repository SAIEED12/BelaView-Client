"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@heroui/react";

const getPageItems = (page, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const window = new Set([1, 2, page - 1, page, page + 1, totalPages - 1, totalPages]);
  const sorted = [...window].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const items = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) items.push("…");
    items.push(p);
    prev = p;
  }
  return items;
};

export function PaginationControls({ page = 1, totalPages = 1, label = "pagination" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const safePage = Number(page ?? 1);
  const safeTotalPages = Math.max(1, Number(totalPages ?? 1));
  const pageItems = useMemo(
    () => getPageItems(safePage, safeTotalPages),
    [safePage, safeTotalPages],
  );

  const goToPage = (nextPage) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }
    const next = params.toString();
    window.scrollTo({ top: 0 });
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  if (safeTotalPages <= 1) return null;

  return (
    <Pagination aria-label={label} className="products-pagination mt-8">
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous
            isDisabled={safePage <= 1}
            onPress={() => goToPage(safePage - 1)}
            aria-label="Previous page"
          >
            <Pagination.PreviousIcon />
          </Pagination.Previous>
        </Pagination.Item>
        {pageItems.map((item, index) =>
          item === "…" ? (
            <Pagination.Item key={`gap-${index}`}>
              <Pagination.Ellipsis>…</Pagination.Ellipsis>
            </Pagination.Item>
          ) : (
            <Pagination.Item key={item}>
              <Pagination.Link
                isActive={item === safePage}
                onPress={() => goToPage(item)}
                aria-label={`Go to page ${item}`}
              >
                {item}
              </Pagination.Link>
            </Pagination.Item>
          ),
        )}
        <Pagination.Item>
          <Pagination.Next
            isDisabled={safePage >= safeTotalPages}
            onPress={() => goToPage(safePage + 1)}
            aria-label="Next page"
          >
            <Pagination.NextIcon />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}
