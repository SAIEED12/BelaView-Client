"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { getCart, saveCart, clearCart as clearServerCart } from "@/lib/actions/cart";
import { sendMetaEvent } from "@/lib/meta-pixel";

const LOCAL_KEY = "belaview:cart-v1";
const MAX_QTY = 99;

const readLocal = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const byId = new Map();
    for (const entry of parsed) {
      if (!entry || typeof entry !== "object") continue;
      const productId = String(entry.productId ?? "").trim();
      if (!productId) continue;
      const qty = Math.min(
        MAX_QTY,
        Math.max(1, Number(entry.qty) || 1)
      );
      const prev = byId.get(productId);
      if (prev) {
        prev.qty = Math.min(MAX_QTY, prev.qty + qty);
      } else {
        byId.set(productId, {
          productId,
          qty,
          name: typeof entry.name === "string" ? entry.name : "",
          price: Number(entry.price) || 0,
          image: typeof entry.image === "string" ? entry.image : "",
        });
      }
    }
    return [...byId.values()];
  } catch {
    return [];
  }
};

const writeLocal = (items) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  } catch {
    // storage unavailable — ignore
  }
};

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { data: session } = useSession();
  const userId = session?.user?.id ? String(session.user.id) : null;

  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [syncedFor, setSyncedFor] = useState(null);
  const saveTimer = useRef(null);
  const itemsRef = useRef([]);
  // Mirror latest items for the login-merge effect (ref read, never render state)
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Initial load from localStorage (client-only; server renders empty)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(readLocal());
    setHydrated(true);
  }, []);

  // Merge local + server on login (updater stays pure: side effects
  // like saveCart/writeLocal run in the effect body, never inside setState)
  useEffect(() => {
    if (!hydrated || !userId || syncedFor === userId) return;
    let cancelled = false;
    const merge = async () => {
      try {
        const serverItems = await getCart();
        if (cancelled) return;
        const byId = new Map();
        for (const it of itemsRef.current) byId.set(it.productId, { ...it });
        for (const s of serverItems) {
          const existing = byId.get(s.productId);
          if (existing) {
            // Idempotent: local and server usually hold the SAME cart after
            // a save, so take the max instead of summing (summing doubles
            // quantities on every refresh).
            existing.qty = Math.min(
              MAX_QTY,
              Math.max(existing.qty, s.quantity)
            );
          } else {
            byId.set(s.productId, {
              productId: s.productId,
              qty: Math.min(MAX_QTY, s.quantity),
              name: "",
              price: 0,
              image: "",
            });
          }
        }
        const merged = [...byId.values()];
        writeLocal(merged);
        // Persist merged union to server (fire-and-forget)
        saveCart(
          merged.map((m) => ({ productId: m.productId, quantity: m.qty }))
        ).catch(() => {});
        if (!cancelled) setItems(merged);
      } catch {
        // offline/server error — stay local-only
      } finally {
        if (!cancelled) setSyncedFor(userId);
      }
    };
    merge();
    return () => {
      cancelled = true;
    };
  }, [hydrated, userId, syncedFor]);

  // Persist local on every change
  useEffect(() => {
    if (!hydrated) return;
    writeLocal(items);
  }, [items, hydrated]);

  // Debounced server sync when logged in
  useEffect(() => {
    if (!hydrated || !userId || syncedFor !== userId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveCart(
        items.map((m) => ({ productId: m.productId, quantity: m.qty }))
      ).catch(() => {});
    }, 600);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [items, hydrated, userId, syncedFor]);

  const addItem = useCallback(({ productId, name = "", price = 0, image = "", qty = 1 }) => {
    const id = String(productId ?? "").trim();
    if (!id) return;
    toast.success("Added to cart!", { duration: 5000 });
    const safeQty = Math.min(MAX_QTY, Math.max(1, Number(qty) || 1));
    sendMetaEvent("AddToCart", {
      content_ids: [id],
      content_type: "product",
      ...(name ? { content_name: name } : {}),
      value: (Number(price) || 0) * safeQty,
      currency: "BDT",
      num_items: safeQty,
    });
    setItems((prev) => {
      const next = prev.map((it) => ({ ...it }));
      const existing = next.find((it) => it.productId === id);
      if (existing) {
        existing.qty = Math.min(MAX_QTY, existing.qty + safeQty);
        if (name) existing.name = name;
        if (Number(price)) existing.price = Number(price);
        if (image) existing.image = image;
      } else {
        next.push({
          productId: id,
          qty: safeQty,
          name,
          price: Number(price) || 0,
          image,
        });
      }
      return next;
    });
  }, []);

  const setQty = useCallback((productId, qty) => {
    const id = String(productId ?? "").trim();
    const n = Number(qty);
    setItems((prev) => {
      if (!Number.isFinite(n) || n <= 0) {
        return prev.filter((it) => it.productId !== id);
      }
      return prev.map((it) =>
        it.productId === id
          ? { ...it, qty: Math.min(MAX_QTY, Math.max(1, Math.floor(n))) }
          : it
      );
    });
  }, []);

  const removeItem = useCallback((productId) => {
    const id = String(productId ?? "").trim();
    setItems((prev) => prev.filter((it) => it.productId !== id));
  }, []);

  const clear = useCallback(async () => {
    setItems([]);
    writeLocal([]);
    if (userId) {
      try {
        await clearServerCart();
      } catch {
        // ignore — local is source of truth for UI
      }
    }
  }, [userId]);

  const value = useMemo(() => {
    const count = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
    const subtotal = items.reduce(
      (sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0),
      0
    );
    return {
      items,
      count,
      subtotal,
      hydrated,
      isGuest: !userId,
      addItem,
      setQty,
      removeItem,
      clear,
    };
  }, [items, hydrated, userId, addItem, setQty, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
