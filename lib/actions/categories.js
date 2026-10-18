"use server";
import { revalidatePath } from "next/cache";
import { authFetchJson } from "../auth-fetch";
import { sortCategoriesByPreferredOrder } from "../categories";
import { toUserMessage } from "../error-message";

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
    return { categories: sortCategoriesByPreferredOrder(data.map(normalizeCategory)) };
  }
  return {
    categories: sortCategoriesByPreferredOrder(
      Array.isArray(data?.categories)
        ? data.categories.map(normalizeCategory)
        : []
    ),
  };
};

export const getCategories = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/categories`, { cache: "no-store" });
    if (!response.ok) return { categories: [] };
    const data = await response.json();
    return normalizePayload(data);
  } catch {
    return { categories: [] };
  }
};

export const createCategory = async (data) => {
  try {
    const result = await authFetchJson(
      `${SERVER_URL}/categories`,
      { method: "POST", body: JSON.stringify(data) },
      "Failed to create category",
    );
    revalidateCategories();
    return normalizeCategory(result);
  } catch (err) {
    console.error("createCategory failed:", err);
    return {
      ok: false,
      error: toUserMessage(err, "Couldn't create the category. Please try again."),
    };
  }
};

export const updateCategory = async (id, data) => {
  try {
    const result = await authFetchJson(
      `${SERVER_URL}/categories/${id}`,
      { method: "PATCH", body: JSON.stringify(data) },
      "Failed to update category",
    );
    revalidateCategories();
    return normalizeCategory(result);
  } catch (err) {
    console.error("updateCategory failed:", err);
    return {
      ok: false,
      error: toUserMessage(err, "Couldn't update the category. Please try again."),
    };
  }
};

export const deleteCategory = async (id) => {
  try {
    const result = await authFetchJson(
      `${SERVER_URL}/categories/${id}`,
      { method: "DELETE" },
      "Failed to delete category",
    );
    revalidateCategories();
    return result;
  } catch (err) {
    console.error("deleteCategory failed:", err);
    return {
      ok: false,
      error: toUserMessage(err, "Couldn't delete the category. Please try again."),
    };
  }
};

export const createSubcategory = async (categoryId, data) => {
  try {
    const result = await authFetchJson(
      `${SERVER_URL}/categories/${categoryId}/subcategories`,
      { method: "POST", body: JSON.stringify(data) },
      "Failed to create sub-category",
    );
    revalidateCategories();
    return normalizeSubcategory(result);
  } catch (err) {
    console.error("createSubcategory failed:", err);
    return {
      ok: false,
      error: toUserMessage(err, "Couldn't create the sub-category. Please try again."),
    };
  }
};

export const updateSubcategory = async (categoryId, subId, data) => {
  try {
    const result = await authFetchJson(
      `${SERVER_URL}/categories/${categoryId}/subcategories/${subId}`,
      { method: "PATCH", body: JSON.stringify(data) },
      "Failed to update sub-category",
    );
    revalidateCategories();
    return normalizeSubcategory(result);
  } catch (err) {
    console.error("updateSubcategory failed:", err);
    return {
      ok: false,
      error: toUserMessage(err, "Couldn't update the sub-category. Please try again."),
    };
  }
};

export const deleteSubcategory = async (categoryId, subId) => {
  try {
    const result = await authFetchJson(
      `${SERVER_URL}/categories/${categoryId}/subcategories/${subId}`,
      { method: "DELETE" },
      "Failed to delete sub-category",
    );
    revalidateCategories();
    return result;
  } catch (err) {
    console.error("deleteSubcategory failed:", err);
    return {
      ok: false,
      error: toUserMessage(err, "Couldn't delete the sub-category. Please try again."),
    };
  }
};

export const seedStarterCategories = async () => {
  try {
    const result = await authFetchJson(
      `${SERVER_URL}/admin/seed-categories`,
      { method: "POST" },
      "Failed to seed starter categories",
    );
    revalidateCategories();
    return result;
  } catch (err) {
    console.error("seedStarterCategories failed:", err);
    return {
      ok: false,
      error: toUserMessage(err, "Couldn't seed the categories. Please try again."),
    };
  }
};