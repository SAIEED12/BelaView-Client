"use client";
import { Pagination, Table } from "@heroui/react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { UpdateProductModal } from "./UpdateProductModal";

const iconButtonClassName =
  "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#525252] transition-colors outline-none hover:bg-brand-soft hover:text-brand focus-visible:ring-2 focus-visible:ring-brand/40";

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

export function ProductTable({ products, total = 0, page = 1, limit = 20, totalPages = 1, categories = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const rows = useMemo(() => (Array.isArray(products) ? products : []), [products]);
  const safeTotal = Number(total ?? rows.length);
  const safePage = Number(page ?? 1);
  const safeLimit = Number(limit ?? 20);
  const safeTotalPages = Math.max(1, Number(totalPages ?? 1));
  const start = safeTotal === 0 ? 0 : (safePage - 1) * safeLimit + 1;
  const end = Math.min(safeTotal, safePage * safeLimit);
  const pageItems = useMemo(() => getPageItems(safePage, safeTotalPages), [safePage, safeTotalPages]);

  const goToPage = (nextPage) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  return (
    <>
      {safeTotal > 0 ? (
        <p className="mb-3 text-sm text-brand font-semibold">
          Showing {start}–{end} of {safeTotal} products
        </p>
      ) : null}
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Products" className="min-w-190">
            <Table.Header>
              <Table.Column isRowHeader>Image</Table.Column>
              <Table.Column>Name</Table.Column>
              <Table.Column>Price</Table.Column>
              <Table.Column>Stock</Table.Column>
              <Table.Column>Actions</Table.Column>
            </Table.Header>
            <Table.Body>
              {rows.map((product) => {
                const id = String(product._id);
                return (
                  <Table.Row key={id}>
                    <Table.Cell>
                      <Image
                        height={40}
                        width={40}
                        unoptimized
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    </Table.Cell>
                    <Table.Cell className="font-bold">{product.name}</Table.Cell>
                    <Table.Cell className="font-semibold">
                      ৳{Number(product.price).toLocaleString()}
                    </Table.Cell>
                    <Table.Cell className={`font-semibold ${product.stock <= 3 ? 'text-red-500' : 'text-green-500'}`}>{product.stock}</Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/products/${id}`}
                          aria-label={`View ${product.name}`}
                          title="View"
                          className={iconButtonClassName}
                        >
                          <Eye size={16} strokeWidth={1.75} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setEditingProduct(product)}
                          aria-label={`Update ${product.name}`}
                          title="Update"
                          className={iconButtonClassName}
                        >
                          <Pencil size={16} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProduct(product)}
                          aria-label={`Delete ${product.name}`}
                          title="Delete"
                          className={`${iconButtonClassName} hover:bg-red-50 hover:text-brand`}
                        >
                          <Trash2 size={16} strokeWidth={1.75} />
                        </button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      {safeTotalPages > 1 ? (
        <Pagination
          aria-label="Products pagination"
          className="mt-4 [&_.pagination__content]:flex-wrap [&_.pagination__content]:justify-center [&_.pagination__content]:self-center"
        >
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
      ) : null}

      <UpdateProductModal
        product={editingProduct}
        categories={categories}
        isOpen={editingProduct !== null}
        onOpenChange={(open) => {
          if (!open) setEditingProduct(null);
        }}
      />
      <DeleteConfirmModal
        product={deletingProduct}
        isOpen={deletingProduct !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingProduct(null);
        }}
      />
    </>
  );
}
