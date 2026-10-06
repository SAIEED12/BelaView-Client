"use server";
import { revalidatePath } from "next/cache";
import { authFetchJson } from "../auth-fetch";

const SERVER_URL = process.env.SERVER_URL;

const CATEGORY_PATHS = [
  "/categories",
  "/categories/[slug]",
  "/categories/[slug]/[subSlug]",
  "/products",
  "/",
  "/dashboard/admin/categories",
];

const revalidateCategories = () => {
  for (const path of CATEGORY_PATHS) {
    if (path.includes("[")) {
      revalidatePath(path, "page");
    } else {
      revalidatePath(path);
    }
  }
};

const normalizeSubcategory = (sub) => ({
  _id: String(sub?._id ?? ""),
  name: String(sub?.name ?? ""),
  slug: String(sub?.slug ?? ""),
  image: sub?.image || null,
  productCount: Number(sub?.productCount ?? 0),
});

const normalizeCategory = (category) => ({
  _id: String(category?._id ?? ""),
  name: String(category?.name ?? ""),
  slug: String(category?.slug ?? ""),
  image: category?.image || null,
  productCount: Number(category?.productCount ?? 0),
  subcategories: Array.isArray(category?.subcategories)
    ? category.subcategories.map(normalizeSubcategory)
    : [],
});

const normalizePayload = (data) => {
  if (Array.isArray(data)) {
    return { categories: data.map(normalizeCategory), unassignedCount: 0 };
  }
  return {
    categories: Array.isArray(data?.categories) ? data.categories.map(normalizeCategory) : [],
    unassignedCount: Number(data?.unassignedCount ?? 0),
  };
};

export const getCategories = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/categories`, { cache: "no-store" });
    if (!response.ok) return { categories: [], unassignedCount: 0 };
    const data = await response.json();
    return normalizePayload(data);
  } catch {
    return { categories: [], unassignedCount: 0 };
  }
};

export const createCategory = async (data) => {
  const result = await authFetchJson(
    `${SERVER_URL}/categories`,
    { method: "POST", body: JSON.stringify(data) },
    "Failed to create category",
  );
  revalidateCategories();
  return normalizeCategory(result);
};

export const updateCategory = async (id, data) => {
  const result = await authFetchJson(
    `${SERVER_URL}/categories/${id}`,
    { method: "PATCH", body: JSON.stringify(data) },
    "Failed to update category",
  );
  revalidateCategories();
  return normalizeCategory(result);
};

export const deleteCategory = async (id) => {
  const result = await authFetchJson(
    `${SERVER_URL}/categories/${id}`,
    { method: "DELETE" },
    "Failed to delete category",
  );
  revalidateCategories();
  return result;
};

export const createSubcategory = async (categoryId, data) => {
  const result = await authFetchJson(
    `${SERVER_URL}/categories/${categoryId}/subcategories`,
    { method: "POST", body: JSON.stringify(data) },
    "Failed to create sub-category",
  );
  revalidateCategories();
  return normalizeSubcategory(result);
};

export const updateSubcategory = async (categoryId, subId, data) => {
  const result = await authFetchJson(
    `${SERVER_URL}/categories/${categoryId}/subcategories/${subId}`,
    { method: "PATCH", body: JSON.stringify(data) },
    "Failed to update sub-category",
  );
  revalidateCategories();
  return normalizeSubcategory(result);
};

export const deleteSubcategory = async (categoryId, subId) => {
  const result = await authFetchJson(
    `${SERVER_URL}/categories/${categoryId}/subcategories/${subId}`,
    { method: "DELETE" },
    "Failed to delete sub-category",
  );
  revalidateCategories();
  return result;
};

export const seedStarterCategories = async () => {
  const result = await authFetchJson(
    `${SERVER_URL}/admin/seed-categories`,
    { method: "POST" },
    "Failed to seed starter categories",
  );
  revalidateCategories();
  return result;
};

export const migrateProductCategories = async () => {
  const result = await authFetchJson(
    `${SERVER_URL}/admin/migrate-product-categories`,
    { method: "POST" },
    "Failed to migrate product categories",
  );
  revalidateCategories();
  return result;
};