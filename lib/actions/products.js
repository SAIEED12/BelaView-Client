"use server"
import { revalidatePath } from "next/cache";
import { authFetch } from "../auth-fetch";
const SERVER_URL = process.env.SERVER_URL;

export const addProduct = async (data) => {
  const response = await authFetch(`${SERVER_URL}/add-products`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  let result = null;
  const raw = await response.text();
  try {
    result = raw ? JSON.parse(raw) : null;
  } catch {
    throw new Error(
      `Failed to add product: ${response.status} ${response.statusText || "Invalid server response"}`
    );
  }
  if (!response.ok) {
    throw new Error(result?.error || result?.msg || `Failed to add product: ${response.status}`);
  }

  revalidatePath("/dashboard/admin/products");

  return result;
};

export const updateProduct = async (id, data) => {
  const response = await authFetch(`${SERVER_URL}/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  let result = null;
  try {
    result = await response.json();
  } catch {
    result = null;
  }
  if (!response.ok) {
    throw new Error(result?.error || result?.msg || "Failed to update product");
  }

  revalidatePath("/dashboard/admin/products");
  revalidatePath(`/products/${id}`);
  revalidatePath("/products");

  return result;
};

const normalizeProduct = (product) => {
  if (!product || typeof product !== "object") return product;
  return { ...product, _id: String(product._id ?? product.id ?? "") };
};

export const getProducts = async () => {
  const response = await fetch(`${SERVER_URL}/products`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  try {
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeProduct) : [];
  } catch {
    return [];
  }
};

export const getAdminProducts = async (search = "", pageOrOptions) => {
  const searchText = String(search ?? "").trim();
  // Pass { page, limit } for server-side pagination; then an envelope
  // { products, total, page, limit, totalPages } is returned.
  let page = null;
  let limit = null;
  if (typeof pageOrOptions === "number") {
    page = pageOrOptions;
  } else if (pageOrOptions && typeof pageOrOptions === "object") {
    page = pageOrOptions.page ?? null;
    limit = pageOrOptions.limit ?? null;
  }
  const params = new URLSearchParams();
  if (searchText) params.set("search", searchText);
  const wantsPagination = page !== null && page !== undefined;
  if (wantsPagination) {
    const pageNum = Number.parseInt(page, 10);
    params.set("page", String(Number.isInteger(pageNum) && pageNum > 0 ? pageNum : 1));
    const limitNum = Number.parseInt(limit, 10);
    params.set("limit", String(Number.isInteger(limitNum) && limitNum > 0 ? Math.min(limitNum, 100) : 20));
  }
  const query = params.size > 0 ? `?${params.toString()}` : "";
  const response = await authFetch(`${SERVER_URL}/products${query}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    let message = "Failed to fetch products";
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
      const list = Array.isArray(data.products) ? data.products.map(normalizeProduct) : [];
      return {
        products: list,
        total: Number(data.total ?? list.length),
        page: Number(data.page ?? 1),
        limit: Number(data.limit ?? 20),
        totalPages: Number(data.totalPages ?? 1),
      };
    }
    return Array.isArray(data) ? data.map(normalizeProduct) : [];
  } catch {
    return wantsPagination
      ? { products: [], total: 0, page: 1, limit: 20, totalPages: 1 }
      : [];
  }
};

export const deleteProduct = async (id) => {
  const response = await authFetch(`${SERVER_URL}/products/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    let message = "Failed to delete product";
    try {
      const errBody = await response.json();
      message = errBody?.error || errBody?.msg || message;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  let result = null;
  try {
    result = await response.json();
  } catch {
    result = { ok: true };
  }

  revalidatePath("/dashboard/admin/products");
  revalidatePath("/products");

  return result;
};

/** Public, paginated product list used by the bulk category assignment tool. */
export const getProductsPage = async ({ page = 1, limit = 50 } = {}) => {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 50));
  try {
    const params = new URLSearchParams({
      page: String(safePage),
      limit: String(safeLimit),
      sort: "name",
    });
    const response = await fetch(`${SERVER_URL}/products?${params.toString()}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return { products: [], total: 0, page: safePage, totalPages: 1 };
    }
    const data = await response.json();
    const list = Array.isArray(data) ? data : data?.products;
    return {
      products: (Array.isArray(list) ? list : []).map(normalizeProduct),
      total: Number(data?.total ?? (Array.isArray(list) ? list.length : 0)),
      page: Number(data?.page ?? safePage),
      totalPages: Math.max(1, Number(data?.totalPages ?? 1)),
    };
  } catch {
    return { products: [], total: 0, page: safePage, totalPages: 1 };
  }
};

export const bulkAssignProductCategory = async (productIds, category, subcategory = "") => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new Error("Select at least one product.");
  }
  const response = await authFetch(`${SERVER_URL}/products/category/bulk`, {
    method: "PATCH",
    body: JSON.stringify({ productIds, category, subcategory }),
  });

  let result = null;
  try {
    result = await response.json();
  } catch {
    result = null;
  }
  if (!response.ok) {
    throw new Error(result?.error || result?.msg || "Failed to update products");
  }

  revalidatePath("/dashboard/admin/categories");
  revalidatePath("/dashboard/admin/products");
  revalidatePath("/categories");
  revalidatePath("/products");

  return result;
};