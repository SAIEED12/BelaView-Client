// components/cart/Drawer.jsx
'use client';

import Image from "next/image";
import { Button, Drawer } from "@heroui/react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";

const triggerClassName =
  "flex h-auto min-w-0 items-center gap-2 rounded-full border border-[#1A1A1A] px-4 py-2 text-xs font-semibold tracking-[0.15em] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white";

export function CartDrawer({ compact = false }) {
  const router = useRouter();
  const { items, count, subtotal, setQty, removeItem, isGuest } = useCart();

  return (
    <Drawer>
      {/* Trigger navbar cart button */}
      {compact ? (
        <Button
          variant="ghost"
          aria-label={`Open cart, ${count} items`}
          className="flex h-auto min-w-0 items-center gap-1 rounded-full border border-ink px-3 py-2 text-ink hover:bg-ink hover:text-white"
        >
          <ShoppingBag size={18} strokeWidth={1.75} />
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
            {count}
          </span>
        </Button>
      ) : (
        <Button
          variant="ghost"
          aria-label={`Open cart, ${count} items`}
          className={triggerClassName}
        >
          <ShoppingBag size={16} strokeWidth={1.75} />
          CART
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
            {count}
          </span>
        </Button>
      )}

      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            <Drawer.Header>
              <Drawer.Heading>Your Cart ({count})</Drawer.Heading>
            </Drawer.Header>

            <Drawer.Body>
              {items.length === 0 ? (
                <div className="flex flex-col gap-2">
                  <p>Your cart is empty.</p>
                  {isGuest ? (
                    <p className="text-xs text-[#8A8A8A]">
                      Sign in to sync your cart across devices.
                    </p>
                  ) : null}
                </div>
              ) : (
                <ul className="flex flex-col gap-4">
                  {items.map((item) => {
                    const lineTotal =
                      (Number(item.price) || 0) * (Number(item.qty) || 0);
                    const lineKey = item.key ?? item.productId;
                    return (
                      <li
                        key={lineKey}
                        className="flex gap-3 border-b border-[#F0F0F0] pb-4 last:border-0"
                      >
                        {item.image ? (
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F5F5F5]">
                            <Image
                              src={item.image}
                              alt={item.name || "Cart item"}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#1A1A1A]">
                            {item.name || item.productId}
                          </p>
                          {item.size ? (
                            <p className="text-xs text-[#8A8A8A]">
                              Size: {item.size}
                            </p>
                          ) : null}
                          <p className="text-xs text-[#8A8A8A]">
                            ৳{(Number(item.price) || 0).toLocaleString()} each
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setQty(lineKey, item.qty - 1)}
                              aria-label={`Decrease quantity of ${item.name || item.productId}`}
                              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#E5E5E5] text-[#1A1A1A] hover:border-brand hover:text-brand"
                            >
                              <Minus size={13} />
                            </button>
                            <span
                              className="w-6 text-center text-sm font-semibold tabular-nums"
                              aria-live="polite"
                            >
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQty(lineKey, item.qty + 1)}
                              aria-label={`Increase quantity of ${item.name || item.productId}`}
                              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#E5E5E5] text-[#1A1A1A] hover:border-brand hover:text-brand"
                            >
                              <Plus size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(lineKey)}
                              aria-label={`Remove ${item.name || item.productId} from cart`}
                              className="ml-auto flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#8A8A8A] hover:bg-red-50 hover:text-brand"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <span className="shrink-0 text-sm font-semibold tabular-nums">
                          ৳{lineTotal.toLocaleString()}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Drawer.Body>

            <Drawer.Footer>
              <div className="flex w-full items-center justify-between gap-2">
                <span className="font-semibold tabular-nums">
                  Total: ৳{subtotal.toLocaleString()}
                </span>
                <div className="flex gap-2">
                  <Button
                    slot="close"
                    variant="secondary"
                    className="cursor-pointer rounded-full border border-[#E5E5E5] bg-transparent px-4 py-2 text-xs font-semibold tracking-[0.12em] text-[#1A1A1A] transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand"
                  >
                    Close
                  </Button>
                  <Button
                    slot="close"
                    isDisabled={items.length === 0}
                    onPress={() => router.push("/checkout?mode=cart")}
                    className="inline-flex cursor-pointer items-center justify-center rounded-full bg-brand px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white no-underline transition-colors outline-none hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Checkout
                  </Button>
                </div>
              </div>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
