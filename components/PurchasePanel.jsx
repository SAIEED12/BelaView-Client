"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2, Minus, Plus, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { saveBuyNow } from "@/lib/buy-now";
import { useCart } from "@/components/cart/CartProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";

const PurchasePanel = ({
  productId,
  name,
  price,
  image = "",
  stock,
  sizes = [],
}) => {
  const router = useRouter();
  const { addItem } = useCart();
  const { has, toggle, togglingId } = useWishlist();
  const inStock = stock > 0;
  const maxQty = Math.max(stock, 1);
  const sizeOptions = Array.isArray(sizes) ? sizes : [];
  const requiresSize = sizeOptions.length > 0;

  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("");
  const [sizeError, setSizeError] = useState(false);
  const wished = has(productId);
  const wishlistBusy = togglingId === String(productId);
  const [isBuying, setIsBuying] = useState(false);

  const chosenSize = requiresSize ? size : "";
  const subtotal = Number(price) * qty;

  const decrease = () => setQty((q) => Math.max(1, q - 1));
  const increase = () => setQty((q) => Math.min(maxQty, q + 1));

  // Sized products need a pick first — flag it instead of dead-ending the click.
  const sizeReady = () => {
    if (requiresSize && !size) {
      setSizeError(true);
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!inStock || !sizeReady()) return;
    const safeQty = Math.min(Math.max(1, qty), maxQty);
    addItem({
      productId,
      name,
      price: Number(price),
      image,
      qty: safeQty,
      size: chosenSize,
    });
  };

  const handleBuyNow = () => {
    if (!inStock || isBuying || !sizeReady()) return;
    setIsBuying(true);
    try {
      const safeQty = Math.min(Math.max(1, qty), maxQty);
      saveBuyNow({
        productId,
        name,
        price: Number(price),
        qty: safeQty,
        size: chosenSize,
      });
      router.push(
        `/checkout?mode=buy-now&productId=${encodeURIComponent(productId)}&qty=${safeQty}${
          chosenSize ? `&size=${encodeURIComponent(chosenSize)}` : ""
        }`
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
      toast.success("Link copied");
    } catch {
      // Native share sheets can be dismissed — nothing worth reporting.
    }
  };

  const stepButton =
    "inline-flex h-8 w-8 items-center justify-center text-ink transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-ink";

  const textAction =
    "inline-flex cursor-pointer items-center gap-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-60";

  return (
    <div className="flex flex-col gap-5">
      {/* Size picker (only for products with sizes) */}
      {requiresSize ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-fog uppercase">
              Select size
            </p>
            {sizeError && !size ? (
              <span
                className="text-[11px] font-medium text-brand"
                aria-live="polite"
              >
                Choose a size to continue
              </span>
            ) : null}
          </div>
          <div
            role="radiogroup"
            aria-label="Select size"
            aria-invalid={sizeError}
            className="flex flex-wrap gap-2"
          >
            {sizeOptions.map((option) => {
              const selected = size === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setSize(option);
                    setSizeError(false);
                  }}
                  disabled={!inStock}
                  className={`inline-flex h-9 min-w-[2.75rem] cursor-pointer items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 ${
                    selected
                      ? "border-brand bg-brand-soft font-semibold text-brand ring-1 ring-brand"
                      : sizeError
                        ? "border-brand/60 bg-white text-ink hover:border-brand"
                        : "border-sand-line bg-white text-ink hover:border-brand/60"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Quantity + live subtotal — receipt strip */}
      <div className="flex items-end justify-between gap-4 border-y border-sand-line py-3.5">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-fog uppercase">
            Quantity
          </p>
          <div
            className="inline-flex w-fit items-center rounded-lg border border-sand-line bg-white"
            role="group"
            aria-label="Quantity"
          >
            <button
              type="button"
              onClick={decrease}
              disabled={!inStock || qty <= 1}
              aria-label="Decrease quantity"
              className={`${stepButton} rounded-l-lg`}
            >
              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span
              className="w-8 text-center text-sm font-semibold tabular-nums text-ink"
              aria-live="polite"
            >
              {qty}
            </span>
            <button
              type="button"
              onClick={increase}
              disabled={!inStock || qty >= maxQty}
              aria-label="Increase quantity"
              className={`${stepButton} rounded-r-lg`}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-fog uppercase">
            Subtotal
          </p>
          <p className="mt-1 text-base font-semibold tabular-nums text-ink">
            ৳{subtotal.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Primary actions */}
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className="flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-lg border border-ink px-4 text-xs font-bold tracking-[0.12em] text-ink uppercase transition-[color,background-color,transform] duration-150 hover:bg-ink hover:text-white active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-ink sm:h-12 sm:text-[13px]"
        >
          Add to Cart
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!inStock || isBuying}
          className="inline-flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-brand bg-brand px-4 text-center text-xs font-bold tracking-[0.12em] text-white uppercase shadow-sm shadow-brand/20 transition-[background-color,transform] duration-150 hover:border-brand-dark hover:bg-brand-dark active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-brand sm:h-12 sm:text-[13px]"
        >
          {isBuying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Processing…
            </>
          ) : (
            "Buy Now"
          )}
        </button>
      </div>

      {/* Secondary actions */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <button
          type="button"
          onClick={handleShare}
          className={`${textAction} text-smoke hover:text-brand`}
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          Share
        </button>

        <button
          type="button"
          onClick={() => toggle(productId)}
          disabled={wishlistBusy}
          aria-pressed={wished}
          className={`${textAction} ${
            wished ? "text-brand" : "text-smoke hover:text-brand"
          }`}
        >
          <Heart
            className={`h-4 w-4 ${wished ? "fill-brand text-brand" : ""}`}
            aria-hidden="true"
          />
          <span>{wished ? "Saved" : "Save to wishlist"}</span>
        </button>
      </div>
    </div>
  );
};

export default PurchasePanel;
