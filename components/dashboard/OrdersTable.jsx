"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Pagination, Table } from "@heroui/react";
import { Ban, Download, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { ORDER_STATUSES } from "@/lib/order-statuses";
import { getAllOrdersForExport } from "@/lib/actions/orders";
import { buildOrdersFilename, downloadCsv, ordersToCsv } from "@/lib/export-orders-csv";
import { OrderCancelModal } from "./OrderCancelModal";
import { OrderDetailsModal } from "./OrderDetailsModal";

const iconButtonClassName =
  "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-smoke transition-colors outline-none hover:bg-brand-soft hover:text-brand focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#525252]";

const statusStyles = {
  pending: "bg-stone-200 text-stone-700",
  confirmed: "bg-amber-100 text-amber-800",
  shipped: "bg-sky-100 text-sky-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const SEARCH_DEBOUNCE_MS = 300;

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

export function OrdersTable({
  orders,
  total = 0,
  page = 1,
  limit = 10,
  totalPages = 1,
  initialStatus = "all",
  initialQuery = "",
  initialDate = "",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [date, setDate] = useState(initialDate);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const timerRef = useRef(null);
  const lastCommittedQueryRef = useRef(initialQuery);
  const lastCommittedDateRef = useRef(initialDate);
  const lastCommittedStatusRef = useRef(initialStatus);
  const searchParamsRef = useRef(searchParams?.toString() ?? "");

  useEffect(() => {
    searchParamsRef.current = searchParams?.toString() ?? "";
  }, [searchParams]);

  useEffect(() => {
    if (initialQuery !== lastCommittedQueryRef.current) {
      lastCommittedQueryRef.current = initialQuery;
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (initialDate !== lastCommittedDateRef.current) {
      lastCommittedDateRef.current = initialDate;
      setDate(initialDate);
    }
  }, [initialDate]);

  useEffect(() => {
    lastCommittedStatusRef.current = initialStatus;
  }, [initialStatus]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const navigate = (updates) => {
    const params = new URLSearchParams(searchParamsRef.current);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    }
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  const handleQueryChange = (e) => {
    const next = e.target.value;
    setQuery(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      lastCommittedQueryRef.current = next.trim();
      const params = new URLSearchParams(searchParamsRef.current);
      if (next.trim()) {
        params.set("q", next.trim());
      } else {
        params.delete("q");
      }
      params.delete("page");
      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleStatusChange = (e) => {
    const next = e.target.value;
    if (timerRef.current) clearTimeout(timerRef.current);
    lastCommittedQueryRef.current = query.trim();
    lastCommittedStatusRef.current = next;
    const params = new URLSearchParams(searchParamsRef.current);
    if (next && next !== "all") {
      params.set("status", next);
    } else {
      params.delete("status");
    }
    params.delete("page");
    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  };

  const commitDate = (next) => {
    const value = typeof next === "string" ? next : "";
    if (timerRef.current) clearTimeout(timerRef.current);
    lastCommittedQueryRef.current = query.trim();
    lastCommittedDateRef.current = value;
    setDate(value);
    const params = new URLSearchParams(searchParamsRef.current);
    if (value) {
      params.set("date", value);
    } else {
      params.delete("date");
    }
    params.delete("page");
    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  };

  const handleDateChange = (e) => {
    commitDate(e.target.value);
  };

  const clearDate = () => {
    commitDate("");
  };

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportError("");
    try {
      // Committed filter values so the CSV matches the table exactly,
      // even if the URL hasn't updated yet.
      const liveStatus = lastCommittedStatusRef.current ?? "all";
      const liveQ = lastCommittedQueryRef.current ?? "";
      const liveDate = lastCommittedDateRef.current ?? "";
      const all = await getAllOrdersForExport({
        status: liveStatus,
        q: liveQ,
        date: liveDate,
      });
      downloadCsv(
        buildOrdersFilename({ date: liveDate, status: liveStatus, q: liveQ }),
        ordersToCsv(all),
      );
      toast.success(`Exported ${all.length} order${all.length === 1 ? "" : "s"} to CSV`);
    } catch (err) {
      const message = err?.message || "Export failed. Please try again.";
      setExportError(message);
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  const goToPage = (nextPage) => {
    if (nextPage <= 1) {
      const params = new URLSearchParams(searchParamsRef.current);
      params.delete("page");
      const next = params.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
      return;
    }
    navigate({ page: nextPage });
  };

  const [viewingOrder, setViewingOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);

  const rows = useMemo(() => (Array.isArray(orders) ? orders : []), [orders]);
  const safeTotal = Number(total ?? rows.length);
  const safePage = Number(page ?? 1);
  const safeLimit = Number(limit ?? 10);
  const safeTotalPages = Math.max(1, Number(totalPages ?? 1));
  const start = safeTotal === 0 ? 0 : (safePage - 1) * safeLimit + 1;
  const end = Math.min(safeTotal, safePage * safeLimit);
  const pageItems = useMemo(() => getPageItems(safePage, safeTotalPages), [safePage, safeTotalPages]);
  const statusValue = ORDER_STATUSES.includes(initialStatus) ? initialStatus : "all";

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="orders-search" className="sr-only">
          Search orders
        </label>
        <input
          id="orders-search"
          value={query}
          onChange={handleQueryChange}
          placeholder="Search by order ID, name, or phone…"
          autoComplete="off"
          className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-fog outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 sm:max-w-sm"
        />
        <label htmlFor="orders-status" className="sr-only">
          Filter by status
        </label>
        <select
          id="orders-status"
          value={statusValue}
          onChange={handleStatusChange}
          className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 sm:w-48"
        >
          <option value="all">All ({safeTotal})</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <label htmlFor="orders-date" className="sr-only">
            Filter by date
          </label>
          <input
            id="orders-date"
            type="date"
            value={date}
            onChange={handleDateChange}
            aria-label="Filter orders by date"
            className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 sm:w-42"
          />
          {date ? (
            <button
              type="button"
              onClick={clearDate}
              aria-label="Clear date filter"
              title="Clear date filter"
              className="shrink-0 cursor-pointer rounded-full px-2 py-1 text-xs font-semibold text-smoke underline-offset-2 outline-none hover:text-brand hover:underline focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              Clear
            </button>
          ) : null}
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || safeTotal === 0}
            aria-label="Download filtered orders as CSV"
            title={
              safeTotal === 0
                ? "No orders to export"
                : "Download all filtered orders as CSV"
            }
            className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-xs font-semibold tracking-[0.08em] text-white transition-colors outline-none hover:bg-brand-dark focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={14} strokeWidth={2} />
            {isExporting ? "EXPORTING…" : "EXPORT CSV"}
          </button>
          <p className="text-sm text-brand font-semibold">
            Showing {start}–{end} of {safeTotal} orders
          </p>
        </div>
      </div>

      {exportError ? (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {exportError}
        </p>
      ) : null}

      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Orders" className="min-w-190">
            <Table.Header>
              <Table.Column isRowHeader>Order</Table.Column>
              <Table.Column>Customer</Table.Column>
              <Table.Column>Items</Table.Column>
              <Table.Column>Total</Table.Column>
              <Table.Column>Date</Table.Column>
              <Table.Column>Status</Table.Column>
              <Table.Column>Actions</Table.Column>
            </Table.Header>
            <Table.Body>
              {rows.map((order) => {
                const id = String(order._id);
                const cancellable =
                  order.orderStatus !== "delivered" &&
                  order.orderStatus !== "cancelled";
                return (
                  <Table.Row key={id}>
                    <Table.Cell className="font-bold">
                      #{id.slice(-6).toUpperCase()}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="block font-semibold text-ink">
                        {order.customer?.name ?? "—"}
                      </span>
                      <span className="block text-xs text-smoke">
                        {order.customer?.phone ?? ""}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="font-semibold">
                      {order.itemCount ?? order.items?.length ?? 0}
                    </Table.Cell>
                    <Table.Cell className="font-semibold">
                      ৳{Number(order.totalAmount ?? 0).toLocaleString()}
                    </Table.Cell>
                    <Table.Cell className="text-smoke">
                      {new Date(order.createdAt).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {<br></br>}
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.orderStatus] ?? statusStyles.pending}`}
                      >
                        {order.orderStatus}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingOrder(order)}
                          aria-label={`View order ${id}`}
                          title="View details"
                          className={iconButtonClassName}
                        >
                          <Eye size={16} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCancellingOrder(order)}
                          disabled={!cancellable}
                          aria-label={`Cancel order ${id}`}
                          title={
                            cancellable
                              ? "Cancel order"
                              : `Order is ${order.orderStatus}`
                          }
                          className={`${iconButtonClassName} hover:bg-red-50 hover:text-brand`}
                        >
                          <Ban size={16} strokeWidth={1.75} />
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

      {rows.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center text-sm text-smoke">
          No orders found. Try a different search or status filter.
        </p>
      ) : null}

      {safeTotalPages > 1 ? (
        <Pagination
          aria-label="Orders pagination"
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

      <OrderDetailsModal
        key={viewingOrder ? String(viewingOrder._id) : "none"}
        order={viewingOrder}
        isOpen={viewingOrder !== null}
        onOpenChange={(open) => {
          if (!open) setViewingOrder(null);
        }}
      />
      <OrderCancelModal
        order={cancellingOrder}
        isOpen={cancellingOrder !== null}
        onOpenChange={(open) => {
          if (!open) setCancellingOrder(null);
        }}
      />
    </>
  );
}
