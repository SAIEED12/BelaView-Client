"use client";

import { useMemo, useState } from "react";
import { Pagination, Table } from "@heroui/react";

const PAGE_SIZE = 10;

const matchesQuery = (customer, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystacks = [
    customer.name ?? "",
    customer.email ?? "",
    customer.phone ?? "",
  ].map((v) => String(v).toLowerCase());
  return haystacks.some((h) => h.includes(q));
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

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

export function CustomersTable({ customers }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const list = Array.isArray(customers) ? customers : [];
    return list.filter((customer) => matchesQuery(customer, query));
  }, [customers, query]);

  const filteredTotal = rows.length;
  const totalPages = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = filteredTotal === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const end = Math.min(filteredTotal, safePage * PAGE_SIZE);
  const pageRows = useMemo(
    () => rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [rows, safePage],
  );
  const pageItems = useMemo(() => getPageItems(safePage, totalPages), [safePage, totalPages]);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="customers-search" className="sr-only">
          Search customers
        </label>
        <input
          id="customers-search"
          value={query}
          onChange={handleQueryChange}
          placeholder="Search by name, email, or phone…"
          className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-fog outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 sm:max-w-sm"
        />
        <p className="text-sm text-brand font-semibold sm:ml-auto">
          Showing {start}–{end} of {filteredTotal} customers
        </p>
      </div>

      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Customers" className="min-w-190">
            <Table.Header>
              <Table.Column isRowHeader>Name</Table.Column>
              <Table.Column>Email</Table.Column>
              <Table.Column>Phone</Table.Column>
              <Table.Column>Joined</Table.Column>
            </Table.Header>
            <Table.Body>
              {pageRows.map((customer) => {
                const id = String(customer._id);
                return (
                  <Table.Row key={id}>
                    <Table.Cell className="font-bold">
                      {customer.name || "—"}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="block font-semibold text-ink">
                        {customer.email || "—"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="block font-semibold text-ink">
                        {customer.phone || "—"}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-smoke">
                      {formatDate(customer.createdAt)}
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
          No customers found. Try a different search.
        </p>
      ) : null}

      {totalPages > 1 ? (
        <Pagination
          aria-label="Customers pagination"
          className="brand-pagination mt-4"
        >
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous
                isDisabled={safePage <= 1}
                onPress={() => setPage(safePage - 1)}
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
                    onPress={() => setPage(item)}
                    aria-label={`Go to page ${item}`}
                  >
                    {item}
                  </Pagination.Link>
                </Pagination.Item>
              ),
            )}
            <Pagination.Item>
              <Pagination.Next
                isDisabled={safePage >= totalPages}
                onPress={() => setPage(safePage + 1)}
                aria-label="Next page"
              >
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      ) : null}
    </>
  );
}
