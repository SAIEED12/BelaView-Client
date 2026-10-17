"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, Share2 } from "lucide-react";
import { saveBuyNow } from "@/lib/buy-now";
import { useCart } from "@/components/cart/CartProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";

const PurchasePanel = ({ productId, name, price, image = "", stock }) => {
  const router = useRouter();
  const { addItem } = useCart();
  const { has, toggle, togglingId } = useWishlist();
  const inStock = stock > 0;
  const maxQty = Math.max(stock, 1);

  const [qty, setQty] = useState(1);
  const wished = has(productId);
  const wishlistBusy = togglingId === String(productId);
  const [copied, setCopied] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const decrease = () => setQty((q) => Math.max(1, q - 1));
  const increase = () => setQty((q) => Math.min(maxQty, q + 1));

  const handleAddToCart = () => {
    if (!inStock) return;
    const safeQty = Math.min(Math.max(1, qty), maxQty);
    addItem({
      productId,
      name,
      price: Number(price),
      image,
      qty: safeQty,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!inStock || isBuying) return;
    setIsBuying(true);
    try {
      const safeQty = Math.min(Math.max(1, qty), maxQty);
      saveBuyNow({ productId, name, price: Number(price), qty: safeQty });
      router.push(
        `/checkout?mode=buy-now&productId=${encodeURIComponent(productId)}&qty=${safeQty}`
      );
    } finally {
      setTimeout(() => setIsBuying((v) => (v ? false : v)), 2000);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      
    }
  };

  const iconButton =
    "inline-flex h-10 w-10 items-center justify-center text-[#1A1A1A] transition-colors hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[#1A1A1A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

  return (
    <div className="flex flex-col gap-5">
      {/* Quantity + live subtotal */}
      <div className="flex items-center justify-between gap-4">
        <div
          className="inline-flex items-center rounded-full border border-sand-line bg-sand-soft"
          role="group"
          aria-label="Quantity"
        >
          <button
            type="button"
            onClick={decrease}
            disabled={!inStock || qty <= 1}
            aria-label="Decrease quantity"
            className={`${iconButton} rounded-l-full`}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span
            className="w-10 text-center text-sm font-semibold tabular-nums text-[#1A1A1A]"
            aria-live="polite"
          >
            {qty}
          </span>
          <button
            type="button"
            onClick={increase}
            disabled={!inStock || qty >= maxQty}
            aria-label="Increase quantity"
            className={`${iconButton} rounded-r-full`}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-[#525252]">
          Subtotal{" "}
          <span className="text-lg font-semibold tabular-nums text-[#1A1A1A]">
            ৳{(Number(price) * qty).toLocaleString()}
          </span>
        </p>
      </div>

      {/* Primary actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className="block w-full cursor-pointer flex-1 rounded-full border border-ink px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-ink"
        >
          Add to Cart{justAdded ? " ✓" : ""}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!inStock || isBuying}
          className="block w-full flex-1 cursor-pointer rounded-full bg-brand px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-brand"
        >
          {isBuying ? "Processing…" : "Buy Now"}
        </button>
      </div>

      {/* Secondary actions */}
      <div className="flex items-center gap-5 text-sm text-[#525252]">
        <button
          type="button"
          onClick={() => toggle(productId)}
          disabled={wishlistBusy}
          aria-pressed={wished}
          className="inline-flex cursor-pointer items-center gap-2 transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-60"
        >
          <Heart
            className={`h-5 w-5${
              wished ? "fill-brand text-brand" : ""
            }`}
          />
          {wished ? "Saved to wishlist" : "Save to wishlist"}
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center cursor-pointer gap-2 transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <Share2 className="h-5 w-5" />
          Share
        </button>

        <span className="text-xs text-green-700" aria-live="polite">
          {copied ? "Link copied" : justAdded ? "Added to cart" : ""}
        </span>
      </div>
    </div>
  );
};

export default PurchasePanel;