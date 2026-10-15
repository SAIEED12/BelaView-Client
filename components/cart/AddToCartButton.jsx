"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";

export function AddToCartButton({
  productId,
  name = "",
  price = 0,
  image = "",
  stock = 1,
  iconOnly = false,
}) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const inStock = Number(stock) > 0;

  const handleClick = () => {
    if (!inStock) return;
    addItem({
      productId,
      name,
      price: Number(price),
      image,
      qty: 1,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  if (iconOnly) {
    const label = !inStock ? "Out of stock" : justAdded ? "Added to cart" : "Add to cart";
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={!inStock}
        aria-live="polite"
        aria-label={label}
        title={label}
        className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-black text-white transition-colors hover:bg-black/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {justAdded ? (
          <Check size={16} aria-hidden="true" />
        ) : (
          <ShoppingCart size={16} aria-hidden="true" />
        )}
        <span className="sr-only">{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!inStock}
      aria-live="polite"
      className="block w-full cursor-pointer rounded-md border bg-ink  px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-ink/80 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-ink sm:py-1"
    >
      {!inStock ? "Out of Stock" : justAdded ? "Added ✓" : "Add to Cart"}
    </button>
  );
}
