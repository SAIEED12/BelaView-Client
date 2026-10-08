"use server";

import { revalidatePath } from "next/cache";
import { ORDER_STATUSES } from "@/lib/order-statuses";
import { authFetch } from "@/lib/auth-fetch";
import { getTokenServer } from "@/lib/getTokenServer";

const SERVER_URL = process.env.SERVER_URL;

const getOptionalAuthHeaders = async () => {
  try {
    const token = await getTokenServer();
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
};

const normalizeOrder = (order) => {
  if (!order || typeof order !== "object") return order;
  const normalized = { ...order, _id: String(order._id ?? order.id ?? "") };
  if (Array.isArray(normalized.items)) {
    normalized.items = normalized.items.map((item) => ({
      ...item,
      productId: String(item.productId ?? ""),
    }));
  }
  return normalized;
};

export const createOrder = async ({ customer, items, deliveryCharge = 60, note = "", userId = null }) => {
  const payload = {
    customer: {
      name: customer.name?.trim(),
      phone: customer.phone?.trim(),
      address: customer.address?.trim(),
    },
    items: items.map((item) => ({
      productId: String(item.productId),
      quantity: Number(item.quantity),
    })),
    paymentMethod: "cod",
    deliveryCharge: Number(deliveryCharge),
    note: typeof note === "string" ? note.trim() : "",
  };

  const cleanUserId = typeof userId === "string" ? userId.trim() : "";
  if (cleanUserId) {
    payload.userId = cleanUserId;
  }

  const response = await fetch(`${SERVER_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await getOptionalAuthHeaders()),
    },
    body: JSON.stringify(payload),
  });

  let result = null;
  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {
    throw new Error(result?.error || "Failed to place order");
  }

  return result;
};

export const getCheckoutProduct = async (id) => {
  const response = await fetch(`${SERVER_URL}/products/${id}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    return null;
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const normalizeDate = (value) => {
  const text = typeof value === "string" ? value.trim() : "";
  return DATE_RE.test(text) ? text : "";
};

export const getOrders = async (phoneOrOptions) => {

  let userId = "";
  let phone = "";
  let page = null;
  let limit = null;
  let status = "";
  let q = "";
  let date = "";
  if (typeof phoneOrOptions === "string") {
    phone = phoneOrOptions;
  } else if (phoneOrOptions && typeof phoneOrOptions === "object") {
    userId = phoneOrOptions.userId ?? "";
    phone = phoneOrOptions.phone ?? "";
    page = phoneOrOptions.page ?? null;
    limit = phoneOrOptions.limit ?? null;
    status = phoneOrOptions.status ?? "";
    q = phoneOrOptions.q ?? "";
    date = normalizeDate(phoneOrOptions.date ?? "");
  }
  const params = new URLSearchParams();
  if (userId && String(userId).trim()) {
    params.set("userId", String(userId).trim());
  }
  if (phone && String(phone).trim()) {
    params.set("phone", String(phone).trim());
  }
  const wantsPagination = page !== null && page !== undefined;
  if (wantsPagination) {
    const pageNum = Number.parseInt(page, 10);
    params.set("page", String(Number.isInteger(pageNum) && pageNum > 0 ? pageNum : 1));
    const limitNum = Number.parseInt(limit, 10);
    params.set("limit", String(Number.isInteger(limitNum) && limitNum > 0 ? Math.min(limitNum, 100) : 10));
  }
  if (status && String(status).trim()) {
    params.set("status", String(status).trim().toLowerCase());
  }
  if (q && String(q).trim()) {
    params.set("q", String(q).trim());
  }
  if (date) {
    params.set("date", date);
  }
  const query = params.size > 0 ? `?${params.toString()}` : "";
  const response = await authFetch(`${SERVER_URL}/orders${query}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    let message = "Failed to fetch orders";
    try {
      const errBody = await response.json();
      message = errBody?.error || errBody?.msg || message;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }
  try {
    const data = await response.json();
    if (wantsPagination && data && typeof data === "object" && !Array.isArray(data)) {
      const list = Array.isArray(data.orders) ? data.orders.map(normalizeOrder) : [];
      return {
        orders: list,
        total: Number(data.total ?? list.length),
        page: Number(data.page ?? 1),
        limit: Number(data.limit ?? 10),
        totalPages: Number(data.totalPages ?? 1),
        pendingCount: Number(data.pendingCount ?? 0),
        deliveredRevenue: Number(data.deliveredRevenue ?? 0),
      };
    }
    return Array.isArray(data) ? data.map(normalizeOrder) : [];
  } catch {
    return wantsPagination
      ? { orders: [], total: 0, page: 1, limit: 10, totalPages: 1, pendingCount: 0, deliveredRevenue: 0 }
      : [];
  }
};

export const getAllOrdersForExport = async (options = {}) => {
  // Fetch every order matching the admin filters (status, q, date) for CSV export.
  const status = typeof options?.status === "string" ? options.status : "";
  const q = typeof options?.q === "string" ? options.q : "";
  const date = normalizeDate(options?.date ?? "");
  const all = [];
  let page = 1;
  let totalPages = 1;
  // Safety bound so a runaway loop can never hang the export.
  const MAX_PAGES = 100;
  for (let i = 0; i < MAX_PAGES; i += 1) {
    const data = await getOrders({ page, limit: 100, status, q, date });
    const batch = Array.isArray(data?.orders) ? data.orders : [];
    all.push(...batch);
    totalPages = Number(data?.totalPages ?? 1);
    if (page >= totalPages || batch.length === 0) break;
    page += 1;
  }
  return all;
};

export const getOrder = async (id) => {
  const response = await authFetch(`${SERVER_URL}/orders/${id}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    return null;
  }
  try {
    return normalizeOrder(await response.json());
  } catch {
    return null;
  }
};

export const updateOrderStatus = async (id, orderStatus) => {
  const status = String(orderStatus || "").trim().toLowerCase();
  if (!ORDER_STATUSES.includes(status)) {
    throw new Error(`orderStatus must be one of: ${ORDER_STATUSES.join(", ")}`);
  }
  const response = await authFetch(`${SERVER_URL}/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ orderStatus: status }),
  });

  let result = null;
  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {
    throw new Error(result?.error || "Failed to update order status");
  }

  revalidatePath("/dashboard/admin/orders");
  revalidatePath("/dashboard/customer/orders");
  revalidatePath("/dashboard/customer");

  return normalizeOrder(result);
};

export const cancelOrder = async (id) => {
  return updateOrderStatus(id, "cancelled");
};
