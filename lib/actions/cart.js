"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { carts } from "@/lib/db/schema";

const MAX_ITEMS = 50;
const MAX_QTY = 99;
const PRODUCT_ID_RE = /^[0-9a-f]{24}$/i;

async function requireUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id ? String(session.user.id) : "";
  if (!userId) {
    throw new Error("Please sign in to sync your cart.");
  }
  return userId;
}

async function optionalUserId() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session?.user?.id ? String(session.user.id) : null;
  } catch {
    return null;
  }
}

const normalizeItems = (items) => {
  if (!Array.isArray(items)) return [];
  const byKey = new Map();
  for (const entry of items) {
    if (!entry || typeof entry !== "object") continue;
    const productId = String(entry.productId ?? entry.id ?? "").trim();
    if (!PRODUCT_ID_RE.test(productId)) continue;
    const quantity = Number(entry.quantity ?? entry.qty ?? 0);
    if (!Number.isInteger(quantity) || quantity <= 0) continue;
    const rawSize = typeof entry.size === "string" ? entry.size.trim() : "";
    // Mirrors the client cart line key: one line per product + size.
    const size =
      !rawSize || rawSize.length > 16 || rawSize.includes(":") ? "" : rawSize;
    const key = size ? `${productId}::${size}` : productId;
    const prev = byKey.get(key) ?? 0;
    byKey.set(key, Math.min(MAX_QTY, prev + quantity));
    if (byKey.size >= MAX_ITEMS) break;
  }
  return [...byKey.entries()].map(([key, quantity]) => {
    const [productId, size = ""] = key.split("::");
    return {
      productId,
      size,
      quantity,
    };
  });
};

const parseStoredItems = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

export const getCart = async () => {
  const userId = await optionalUserId();
  if (!userId) return [];

  const [row] = await db
    .select({ items: carts.items })
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);

  return normalizeItems(parseStoredItems(row?.items));
};

export const saveCart = async (items) => {
  const userId = await requireUserId();
  const clean = normalizeItems(items);
  const now = new Date();
  const storedItems = JSON.stringify(clean);

  await db
    .insert(carts)
    .values({
      userId,
      items: storedItems,
      createdAt: now,
      updatedAt: now,
    })
    .onDuplicateKeyUpdate({
      set: {
        items: storedItems,
        updatedAt: now,
      },
    });

  return clean;
};

export const clearCart = async () => {
  const userId = await requireUserId();
  await db.delete(carts).where(eq(carts.userId, userId));
  return { ok: true };
};
