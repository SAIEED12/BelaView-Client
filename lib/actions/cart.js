"use server";

import { headers } from "next/headers";
import { MongoClient, ObjectId } from "mongodb";
import { auth } from "@/lib/auth";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "dolna_db";
const MAX_ITEMS = 50;
const MAX_QTY = 99;

let cachedClient = globalThis.__dolnaMongoClient ?? null;

async function getDb() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI);
    globalThis.__dolnaMongoClient = cachedClient;
  }
  if (!cachedClient.topology?.isConnected?.()) {
    try {
      await cachedClient.connect();
    } catch (err) {
      if (!String(err?.message ?? "").includes("already")) throw err;
    }
  }
  const db = cachedClient.db(DB_NAME);
  await db
    .collection("carts")
    .createIndex({ userId: 1 }, { unique: true })
    .catch(() => {});
  return db;
}

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
    if (!ObjectId.isValid(productId)) continue;
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

export const getCart = async () => {
  const userId = await optionalUserId();
  if (!userId) return [];
  const db = await getDb();
  const doc = await db.collection("carts").findOne({ userId });
  return normalizeItems(doc?.items);
};

export const saveCart = async (items) => {
  const userId = await requireUserId();
  const clean = normalizeItems(items);
  const db = await getDb();
  await db.collection("carts").updateOne(
    { userId },
    { $set: { userId, items: clean, updatedAt: new Date() } },
    { upsert: true }
  );
  return clean;
};

export const clearCart = async () => {
  const userId = await requireUserId();
  const db = await getDb();
  await db.collection("carts").deleteOne({ userId });
  return { ok: true };
};
