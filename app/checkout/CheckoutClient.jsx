"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Minus,
  Phone,
  Plus,
  RotateCcw,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { readBuyNow, clearBuyNow } from "@/lib/buy-now";
import { createOrder, getCheckoutProduct } from "@/lib/actions/orders";
import { sendMetaEvent } from "@/lib/meta-pixel";
import { useCart } from "@/components/cart/CartProvider";
import { SkeletonBlock } from "@/components/loading/skeletons";

const DELIVERY_AREAS = [
  { id: "inside-dhaka", label: "Inside Dhaka", charge: 70 },
  { id: "outside-dhaka", label: "Outside Dhaka", charge: 120 },
];
const BD_PHONE_RE = /^(?:\+?88)?01[3-9]\d{8}$/;
const normalizePhone = (value) =>
  String(value ?? "").trim().replace(/[\s-]+/g, "");

const cardClass =
  "rounded-3xl border border-sand-line bg-white shadow-[0_18px_44px_-32px_rgba(26,26,26,0.35)]";

const inputClass =
  "w-full max-w-full rounded-xl border border-sand-line bg-cream px-4 py-3 text-base text-ink placeholder:text-fog outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20 sm:text-sm";

const pillLinkClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs font-semibold tracking-[0.12em] text-white no-underline transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const submitButtonClass =
  "block min-h-12 w-full cursor-pointer rounded-full bg-brand px-6 py-3 text-center text-xs font-semibold break-words whitespace-normal uppercase tracking-[0.08em] text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm";

const stepperButtonClass =
  "inline-flex touch-manipulation items-center justify-center text-ink transition-colors hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const summaryRowClass =
  "flex gap-3 rounded-2xl border border-sand-line/70 bg-sand-soft/60 p-3 sm:gap-4 sm:p-4";

const thumbClass =
  "relative shrink-0 overflow-hidden rounded-xl bg-sand-soft ring-1 ring-sand-line";

function CheckoutHeader() {
  return (
    <header className="border-b border-sand-line bg-sand">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Secure checkout
        </p>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl lg:text-4xl">
          Checkout
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-smoke">
          Cash on delivery · Delivery charge ৳70 inside Dhaka · ৳120 outside
          Dhaka · We call to confirm every order before it ships.
        </p>
      </div>
    </header>
  );
}

function StepHeading({ step, children }) {
  return (
    <h2 className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink">
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand"
      >
        {step}
      </span>
      {children}
    </h2>
  );
}

function PaymentMethodFieldset() {
  return (
    <fieldset className="rounded-2xl border border-sand-line bg-cream p-4 sm:p-5">
      <legend className="sr-only">Payment method</legend>
      <p aria-hidden="true" className="text-sm font-medium text-ink">
        Payment method
      </p>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand/30 bg-white p-3.5">
        <input
          type="radio"
          checked
          readOnly
          className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
        />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ink">
            Cash on Delivery
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-smoke">
            Pay in cash when your order arrives. We call to confirm before
            dispatch.
          </span>
        </span>
      </label>
    </fieldset>
  );
}

function DeliveryAreaRadios({ value, onChange, showError }) {
  return (
    <div
      role="radiogroup"
      aria-label="Delivery area"
      className="flex flex-col gap-2"
    >
      {DELIVERY_AREAS.map((area) => {
        const selected = value === area.id;
        return (
          <label
            key={area.id}
            className={`flex cursor-pointer items-center gap-2.5 rounded-xl border bg-white px-3 py-2.5 transition-colors ${
              selected
                ? "border-brand/30"
                : "border-sand-line hover:border-brand/40"
            }`}
          >
            <input
              type="radio"
              name="co-delivery-area"
              value={area.id}
              checked={selected}
              onChange={() => onChange(area.id)}
              className="h-4 w-4 shrink-0 accent-brand"
            />
            <span className="min-w-0 flex-1 text-sm font-semibold text-ink">
              {area.label}
            </span>
            <span className="text-sm font-semibold tabular-nums text-ink">
              ৳{area.charge}
            </span>
          </label>
        );
      })}
      {showError ? (
        <p className="text-xs font-medium text-red-700">
          Please select a delivery area.
        </p>
      ) : null}
    </div>
  );
}

function CheckoutHelp() {
  return (
    <ul className="mt-1 flex flex-col gap-2.5 border-t border-sand-line pt-4 text-xs text-smoke sm:text-sm">
      <li className="flex items-start gap-2.5">
        <Truck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <span>Cash on delivery — pay in cash when your order arrives.</span>
      </li>
      <li className="flex items-start gap-2.5">
        <RotateCcw
          aria-hidden="true"
          className="mt-0.5 h-4 w-4 shrink-0 text-brand"
        />
        <span>
          Something not right? Read our{" "}
          <Link
            href="/return-policy"
            className="font-semibold text-brand underline underline-offset-4 hover:text-brand-dark"
          >
            return policy
          </Link>
          .
        </span>
      </li>
      <li className="flex items-start gap-2.5">
        <Phone aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <span>
          Questions? Call{" "}
          <a
            href="tel:+8801965599181"
            className="font-semibold text-brand underline underline-offset-4 hover:text-brand-dark"
          >
            +8801965599181
          </a>
          .
        </span>
      </li>
    </ul>
  );
}

function DeliveryDetailsForm({
  onSubmit,
  name,
  setName,
  phone,
  setPhone,
  address,
  setAddress,
  deliveryArea,
  setDeliveryArea,
  notes,
  setNotes,
  errors,
  touched,
  submitError,
  submitting,
  submitDisabled,
  submitLabel,
}) {
  return (
    <section className={`${cardClass} p-4 sm:p-5 lg:p-6`}>
      <StepHeading step={2}>Delivery details</StepHeading>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="co-name" className="mb-1.5 block text-sm font-medium text-ink">
            Full name
          </label>
          <input
            id="co-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            autoComplete="name"
            className={inputClass}
            aria-invalid={touched && errors.name ? true : undefined}
            aria-describedby={touched && errors.name ? "co-name-error" : undefined}
          />
          {touched && errors.name ? (
            <p id="co-name-error" className="mt-1.5 text-xs font-medium text-red-700">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="co-phone" className="mb-1.5 block text-sm font-medium text-ink">
            Phone Number (BD)
          </label>
          <input
            id="co-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 01XXXXXXXXX or +8801XXXXXXXXX"
            inputMode="tel"
            autoComplete="tel"
            className={inputClass}
            aria-invalid={touched && errors.phone ? true : undefined}
            aria-describedby={touched && errors.phone ? "co-phone-error" : undefined}
          />
          {touched && errors.phone ? (
            <p id="co-phone-error" className="mt-1.5 text-xs font-medium text-red-700">
              {errors.phone}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="co-address" className="mb-1.5 block text-sm font-medium text-ink">
            Address
          </label>
          <textarea
            id="co-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="House, road, area"
            rows={3}
            autoComplete="street-address"
            className={`${inputClass} resize-y`}
            aria-invalid={touched && errors.address ? true : undefined}
            aria-describedby={touched && errors.address ? "co-address-error" : undefined}
          />
          {touched && errors.address ? (
            <p id="co-address-error" className="mt-1.5 text-xs font-medium text-red-700">
              {errors.address}
            </p>
          ) : null}
        </div>

        <DeliveryAreaRadios
          value={deliveryArea}
          onChange={setDeliveryArea}
          showError={touched && !deliveryArea}
        />

        <div>
          <label htmlFor="co-notes" className="mb-1.5 block text-sm font-medium text-ink">
            Note <span className="font-normal text-fog">(optional)</span>
          </label>
          <textarea
            id="co-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Delivery instructions"
            rows={2}
            maxLength={500}
            className={`${inputClass} resize-y`}
            aria-invalid={touched && errors.notes ? true : undefined}
            aria-describedby={touched && errors.notes ? "co-notes-error" : undefined}
          />
          {touched && errors.notes ? (
            <p id="co-notes-error" className="mt-1.5 text-xs font-medium text-red-700">
              {errors.notes}
            </p>
          ) : null}
        </div>

        <PaymentMethodFieldset />

        {submitError ? (
          <p
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {submitError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitDisabled}
          className={submitButtonClass}
        >
          {submitting ? "Placing order…" : submitLabel}
        </button>

        <CheckoutHelp />
      </form>
    </section>
  );
}

export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const paramProductId = searchParams.get("productId") || "";
  const paramQty = Number(searchParams.get("qty") || "1");
  const paramSize = (searchParams.get("size") || "").trim();
  const mode = searchParams.get("mode") || "";
  const isCartMode = mode === "cart" || !paramProductId;

  const {
    items: cartItems,
    setQty: setCartQty,
    removeItem: removeCartItem,
    clear: clearCartStore,
  } = useCart();
  const [liveMap, setLiveMap] = useState({});
  const [loadingCart, setLoadingCart] = useState(isCartMode);

  const [snapshot] = useState(() => readBuyNow());
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");

  const [qty, setQty] = useState(
    Number.isInteger(paramQty) && paramQty > 0 ? paramQty : 1
  );
  const [name, setName] = useState(() => session?.user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryArea, setDeliveryArea] = useState("");
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [order, setOrder] = useState(null);


  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!paramProductId) {
        setLoadingProduct(false);
        return;
      }
      setLoadingProduct(true);
      setProductError("");
      const live = await getCheckoutProduct(paramProductId);
      if (cancelled) return;
      if (!live) {
        setProduct(null);
        setProductError("Product not found. It may have been removed.");
      } else {
        setProduct(live);
        const stock = Number(live.stock) || 0;
        if (stock <= 0) {
          setProductError("This product is out of stock.");
        } else if (qty > stock) {
          setQty(stock);
        }
      }
      setLoadingProduct(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [paramProductId]);

  const stock = Number(product?.stock) || 0;
  const unitPrice = product ? Number(product.price) : Number(snapshot?.price) || 0;
  const displayName = product?.name || product?.title || snapshot?.name || "";
  const displayImage = product?.image || product?.images?.[0] || "";
  const outOfStock = product ? stock <= 0 : false;
  const clampedQty = stock > 0 ? Math.min(Math.max(1, qty), stock) : qty;

  // Buy Now carries the picked size via the URL (fallback: the session snapshot).
  const chosenSize = (paramSize || String(snapshot?.size ?? "")).trim().slice(0, 16);
  const productSizes =
    product && Array.isArray(product.sizes) ? product.sizes.filter(Boolean) : [];
  const sizeMissing = productSizes.length > 0 && !productSizes.includes(chosenSize);
  const orderSize = sizeMissing ? "" : chosenSize;

  const deliveryCharge =
    DELIVERY_AREAS.find((area) => area.id === deliveryArea)?.charge ?? 0;
  const subtotal = unitPrice * clampedQty;
  const total = subtotal + deliveryCharge;

  // ---- Multi-item cart mode ----
  const cartIdsKey = cartItems.map((it) => it.productId).join(",");

  useEffect(() => {
    if (!isCartMode) return;
    let cancelled = false;
    const load = async () => {
      if (cartItems.length === 0) {
        setLiveMap({});
        setLoadingCart(false);
        return;
      }
      setLoadingCart(true);
      const entries = await Promise.all(
        cartItems.map(async (it) => {
          try {
            const live = await getCheckoutProduct(it.productId);
            return [it.productId, live];
          } catch {
            return [it.productId, null];
          }
        })
      );
      if (cancelled) return;
      setLiveMap(Object.fromEntries(entries));
      setLoadingCart(false);
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCartMode, cartIdsKey]);

  const cartLines = useMemo(
    () =>
      cartItems.map((it) => {
        const live = liveMap[it.productId];
        const liveStock = live ? Number(live.stock) || 0 : null;
        const price =
          live && Number.isFinite(Number(live.price))
            ? Number(live.price)
            : Number(it.price) || 0;
        const effectiveQty =
          liveStock !== null && liveStock > 0
            ? Math.min(Math.max(1, it.qty), liveStock)
            : it.qty;
        const lineSizes = live && Array.isArray(live.sizes) ? live.sizes.filter(Boolean) : [];
        const lineSizeMissing =
          lineSizes.length > 0 && !(it.size && lineSizes.includes(it.size));
        return {
          ...it,
          key: it.key ?? it.productId,
          name: live?.name || live?.title || it.name || it.productId,
          image: live?.image || live?.images?.[0] || it.image || "",
          price,
          stock: liveStock,
          effectiveQty,
          lineTotal: price * effectiveQty,
          missing: live === null,
          outOfStock: liveStock !== null && liveStock <= 0,
          sizeMissing: lineSizeMissing,
        };
      }),
    [cartItems, liveMap]
  );

  const cartSubtotal = cartLines.reduce((sum, l) => sum + l.lineTotal, 0);
  const cartTotal = cartSubtotal + deliveryCharge;
  const cartBlocked = cartLines.some(
    (l) => l.missing || l.outOfStock || l.sizeMissing
  );

  // ---- Meta Pixel: InitiateCheckout ----
  // Fires once per checkout context (single product, or a given cart item set).
  // The key changes only when the context changes, so quantity tweaks or
  // re-renders don't re-fire it.
  const initiateCheckoutKey = isCartMode
    ? !loadingCart && !cartBlocked && cartLines.length > 0
      ? `cart:${cartLines.map((l) => l.productId).join(",")}`
      : ""
    : product && !outOfStock && !loadingProduct
      ? `product:${paramProductId}`
      : "";
  const initiateCheckoutTracked = useRef("");

  useEffect(() => {
    if (!initiateCheckoutKey) return;
    if (initiateCheckoutTracked.current === initiateCheckoutKey) return;
    initiateCheckoutTracked.current = initiateCheckoutKey;

    if (isCartMode) {
      sendMetaEvent("InitiateCheckout", {
        value: cartTotal,
        currency: "BDT",
        content_ids: cartLines.map((l) => String(l.productId)),
        content_type: "product",
        num_items: cartLines.reduce((n, l) => n + l.effectiveQty, 0),
      });
    } else {
      sendMetaEvent("InitiateCheckout", {
        value: total,
        currency: "BDT",
        content_ids: [String(paramProductId)],
        content_type: "product",
        num_items: clampedQty,
      });
    }
  }, [
    initiateCheckoutKey,
    isCartMode,
    cartTotal,
    cartLines,
    total,
    clampedQty,
    paramProductId,
  ]);

  const handleCartSubmit = async (ev) => {
    ev.preventDefault();
    setTouched(true);
    setSubmitError("");
    if (
      Object.keys(errors).length !== 0 ||
      submitting ||
      cartItems.length === 0 ||
      loadingCart ||
      cartBlocked ||
      !deliveryArea
    )
      return;
    setSubmitting(true);
    try {
      const fullAddress = address.trim();
      const placed = await createOrder({
        customer: { name: name.trim(), phone: normalizePhone(phone), address: fullAddress },
        items: cartLines.map((l) => ({
          productId: l.productId,
          quantity: l.effectiveQty,
          size: l.sizeMissing ? "" : l.size || "",
        })),
        deliveryCharge,
        note: notes,
        userId: session?.user?.id ?? null,
      });
      clearBuyNow();
      await clearCartStore();
      sendMetaEvent(
        "Purchase",
        {
          value: Number(placed.totalAmount) || cartTotal,
          currency: "BDT",
          content_ids: cartLines.map((l) => String(l.productId)),
          content_type: "product",
          num_items: cartLines.reduce((n, l) => n + l.effectiveQty, 0),
          order_id: String(placed._id || placed.id || ""),
        },
        { phone: normalizePhone(phone) }
      );
      setOrder(placed);
    } catch (err) {
      setSubmitError(err?.message || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const errors = {};
  if (!name.trim()) errors.name = "Name is required.";
  const phoneValue = normalizePhone(phone);
  if (!phoneValue) errors.phone = "Phone is required.";
  else if (!BD_PHONE_RE.test(phoneValue))
    errors.phone =
      "Enter a valid BD mobile (e.g. 01XXXXXXXXX or +8801XXXXXXXXX). Dashes/spaces allowed.";
  if (!address.trim()) errors.address = "Address is required.";
  if (notes.trim().length > 500)
    errors.notes = "Note must be at most 500 characters.";

  const baseValid =
    Object.keys(errors).length === 0 &&
    !outOfStock &&
    !sizeMissing &&
    clampedQty > 0 &&
    !loadingProduct;
  const isValid = baseValid && Boolean(deliveryArea);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setTouched(true);
    setSubmitError("");
    if (!isValid || submitting) return;
    if (!paramProductId) {
      setSubmitError("No product selected for checkout.");
      return;
    }
    setSubmitting(true);
    try {
      const fullAddress = address.trim();
      const placed = await createOrder({
        customer: { name: name.trim(), phone: normalizePhone(phone), address: fullAddress },
        items: [{ productId: paramProductId, quantity: clampedQty, size: orderSize }],
        deliveryCharge,
        note: notes,
        userId: session?.user?.id ?? null,
      });
      clearBuyNow();
      sendMetaEvent(
        "Purchase",
        {
          value: Number(placed.totalAmount) || total,
          currency: "BDT",
          content_ids: [String(paramProductId)],
          content_type: "product",
          num_items: clampedQty,
          order_id: String(placed._id || placed.id || ""),
        },
        { phone: normalizePhone(phone) }
      );
      setOrder(placed);
    } catch (err) {
      setSubmitError(err?.message || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (order) {
    const orderId = String(order._id || order.id || "");
    const orderTotal = Number(order.totalAmount || total);
    const confirmPhone = order?.customer?.phone || normalizePhone(phone);
    return (
      <main className="flex flex-1 items-center bg-sand-soft">
        <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className={`${cardClass} p-6 text-center sm:p-8`}>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
              <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Order confirmed
            </p>
            <h1 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">
              Order placed!
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-smoke">
              Thank you for shopping with BelaView. We will call{" "}
              <span className="font-semibold break-words text-ink">
                {confirmPhone}
              </span>{" "}
              to confirm delivery.
            </p>

            <dl className="mt-6 divide-y divide-sand-line overflow-hidden rounded-2xl border border-sand-line bg-cream text-left text-sm">
              {orderId ? (
                <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                  <dt className="text-smoke">Order ID</dt>
                  <dd className="text-right font-semibold break-all text-ink">
                    {orderId}
                  </dd>
                </div>
              ) : null}
              <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                <dt className="text-smoke">Payment</dt>
                <dd className="font-semibold text-ink">Cash on Delivery</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                <dt className="text-smoke">Total</dt>
                <dd className="font-semibold tabular-nums text-brand">
                  ৳{orderTotal.toLocaleString()}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link href="/products" className={pillLinkClass}>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isCartMode) {
    const cartReady =
      Object.keys(errors).length === 0 &&
      cartItems.length > 0 &&
      !loadingCart &&
      !cartBlocked;

    if (!loadingCart && cartItems.length === 0) {
      return (
        <main className="flex flex-1 flex-col bg-sand-soft">
          <CheckoutHeader />
          <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <div className={`${cardClass} p-6 text-center sm:p-8`}>
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
                <ShoppingBag className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="mt-5 font-serif text-xl font-semibold text-ink sm:text-2xl">
                Your cart is empty
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-smoke">
                Add a product to your cart and come back here to complete your
                order.
              </p>
              <Link href="/products" className={`${pillLinkClass} mt-6`}>
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
      );
    }

    return (
      <main className="flex flex-1 flex-col bg-sand-soft">
        <CheckoutHeader />

        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            {/* Order summary */}
            <section
              className={`${cardClass} h-fit self-start p-4 sm:p-5 lg:sticky lg:top-34 lg:p-6`}
            >
              <StepHeading step={1}>
                Order summary ({cartItems.length}{" "}
                {cartItems.length === 1 ? "item" : "items"})
              </StepHeading>
              {loadingCart ? (
                <p className="mt-4 text-sm text-smoke">Loading cart…</p>
              ) : (
                <ul className="mt-4 flex flex-col gap-3">
                  {cartLines.map((line) => (
                    <li key={line.key} className={summaryRowClass}>
                      {line.image ? (
                        <div className={`${thumbClass} h-16 w-16 sm:h-20 sm:w-20`}>
                          <Image
                            src={line.image}
                            alt={line.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold wrap-break-word text-ink sm:text-base">
                          {line.name}
                        </p>
                        {line.size ? (
                          <p className="text-xs text-smoke">Size: {line.size}</p>
                        ) : null}
                        {line.missing ? (
                          <span className="mt-1.5 inline-flex w-fit items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                            No longer available — please remove it.
                          </span>
                        ) : line.outOfStock ? (
                          <span className="mt-1.5 inline-flex w-fit items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                            Out of stock.
                          </span>
                        ) : line.sizeMissing ? (
                          <span className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                            Choose a size —{" "}
                            <Link
                              href={`/products/${line.productId}`}
                              className="font-semibold underline underline-offset-2"
                            >
                              select size
                            </Link>
                          </span>
                        ) : line.stock !== null && line.effectiveQty >= line.stock ? (
                          <span className="mt-1.5 inline-flex w-fit items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                            Only {line.stock} available
                          </span>
                        ) : null}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <div
                            role="group"
                            aria-label={`Quantity for ${line.name}`}
                            className="inline-flex items-center rounded-full border border-sand-line bg-white"
                          >
                            <button
                              type="button"
                              onClick={() => setCartQty(line.key, line.effectiveQty - 1)}
                              disabled={line.effectiveQty <= 1}
                              aria-label={`Decrease quantity of ${line.name}`}
                              className={`${stepperButtonClass} h-9 w-9 rounded-l-full`}
                            >
                              <Minus aria-hidden="true" className="h-3.5 w-3.5" />
                            </button>
                            <span
                              aria-live="polite"
                              className="w-8 text-center text-sm font-semibold tabular-nums text-ink"
                            >
                              {line.effectiveQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setCartQty(line.key, line.effectiveQty + 1)}
                              disabled={line.stock !== null && line.effectiveQty >= line.stock}
                              aria-label={`Increase quantity of ${line.name}`}
                              className={`${stepperButtonClass} h-9 w-9 rounded-r-full`}
                            >
                              <Plus aria-hidden="true" className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCartItem(line.key)}
                            aria-label={`Remove ${line.name} from cart`}
                            className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-fog transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                          >
                            <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                        ৳{line.lineTotal.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <dl className="mt-5 space-y-2.5 border-t border-sand-line pt-4 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-smoke">Subtotal</dt>
                  <dd className="text-right font-semibold wrap-break-word text-ink tabular-nums">
                    ৳{cartSubtotal.toLocaleString()}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-smoke">Delivery charge</dt>
                  <dd className="text-right font-semibold wrap-break-word text-ink tabular-nums">
                    {deliveryArea ? (
                      `৳${deliveryCharge.toLocaleString()}`
                    ) : (
                      <span className="font-medium text-fog">Select area</span>
                    )}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-t border-sand-line pt-3">
                  <dt className="text-base font-semibold text-ink sm:text-lg">
                    Total (COD)
                    {!deliveryArea ? (
                      <span className="ml-1.5 text-xs font-normal text-fog">
                        (excl. delivery)
                      </span>
                    ) : null}
                  </dt>
                  <dd
                    className={`text-right font-semibold wrap-break-word text-lg tabular-nums sm:text-xl ${
                      deliveryArea ? "text-brand" : "text-smoke"
                    }`}
                  >
                    ৳{cartTotal.toLocaleString()}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Shipping + payment form */}
            <DeliveryDetailsForm
              onSubmit={handleCartSubmit}
              name={name}
              setName={setName}
              phone={phone}
              setPhone={setPhone}
              address={address}
              setAddress={setAddress}
              deliveryArea={deliveryArea}
              setDeliveryArea={setDeliveryArea}
              notes={notes}
              setNotes={setNotes}
              errors={errors}
              touched={touched}
              submitError={submitError}
              submitting={submitting}
              submitDisabled={!cartReady || submitting}
              submitLabel={`Place order · ৳${cartTotal.toLocaleString()}`}
            />
          </div>
        </div>
      </main>
    );
  }
  if (!paramProductId) {
    return (
      <main className="flex flex-1 flex-col bg-sand-soft">
        <CheckoutHeader />
        <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className={`${cardClass} p-6 text-center sm:p-8`}>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
              <ShoppingBag className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-serif text-xl font-semibold text-ink sm:text-2xl">
              No product selected
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-smoke">
              Start with Buy Now from a product page to check out.
            </p>
            <Link href="/products" className={`${pillLinkClass} mt-6`}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col bg-sand-soft">
      <CheckoutHeader />

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Order summary */}
          <section
            className={`${cardClass} h-fit self-start p-4 sm:p-5 lg:sticky lg:top-34 lg:p-6`}
          >
            <StepHeading step={1}>Order summary</StepHeading>
            {loadingProduct ? (
              <div className="mt-4 flex gap-3 sm:gap-4">
                <SkeletonBlock className="h-16 w-16 shrink-0 rounded-xl sm:h-20 sm:w-20" />
                <div className="min-w-0 flex-1">
                  <SkeletonBlock className="h-4 w-3/4" />
                  <SkeletonBlock className="mt-2 h-4 w-1/3" />
                  <SkeletonBlock className="mt-3 h-10 w-32 rounded-full" />
                </div>
              </div>
            ) : productError && !product ? (
              <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {productError}
              </p>
            ) : (
              <div className={`${summaryRowClass} mt-4`}>
                {displayImage ? (
                  <div className={`${thumbClass} h-16 w-16 sm:h-20 sm:w-20`}>
                    <Image
                      src={displayImage}
                      alt={displayName}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold break-words text-ink sm:text-base">
                    {displayName}
                  </p>
                  <p className="mt-1 text-sm font-semibold tabular-nums text-smoke">
                    ৳{unitPrice.toLocaleString()}
                  </p>
                  {!sizeMissing && chosenSize ? (
                    <p className="mt-1 text-xs font-medium text-smoke">
                      Size: {chosenSize}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
                    <div
                      role="group"
                      aria-label="Quantity"
                      className="inline-flex items-center rounded-full border border-sand-line bg-white"
                    >
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        disabled={clampedQty <= 1}
                        aria-label="Decrease quantity"
                        className={`${stepperButtonClass} h-10 w-10 rounded-l-full`}
                      >
                        <Minus aria-hidden="true" className="h-4 w-4" />
                      </button>
                      <span
                        aria-live="polite"
                        className="w-10 text-center text-sm font-semibold tabular-nums text-ink"
                      >
                        {clampedQty}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQty((q) => (stock > 0 ? Math.min(stock, q + 1) : q + 1))
                        }
                        disabled={stock > 0 && clampedQty >= stock}
                        aria-label="Increase quantity"
                        className={`${stepperButtonClass} h-10 w-10 rounded-r-full`}
                      >
                        <Plus aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </div>
                    {stock > 0 && clampedQty >= stock ? (
                      <span className="inline-flex w-fit items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                        Only {stock} available
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            {productError && product ? (
              <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {productError}
              </p>
            ) : null}

            {sizeMissing ? (
              <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                This product needs a size.{" "}
                <Link
                  href={`/products/${paramProductId}`}
                  className="font-semibold underline underline-offset-2"
                >
                  Go back and select one
                </Link>
                .
              </p>
            ) : null}

            <dl className="mt-5 space-y-2.5 border-t border-sand-line pt-4 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-smoke">Subtotal</dt>
                <dd className="text-right font-semibold wrap-break-word text-ink tabular-nums">
                  ৳{subtotal.toLocaleString()}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-smoke">Delivery charge</dt>
                <dd className="text-right font-semibold wrap-break-word text-ink tabular-nums">
                  {deliveryArea ? (
                    `৳${deliveryCharge.toLocaleString()}`
                  ) : (
                    <span className="font-medium text-fog">Select area</span>
                  )}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-sand-line pt-3">
                <dt className="text-base font-semibold text-ink sm:text-lg">
                  Total (COD)
                  {!deliveryArea ? (
                    <span className="ml-1.5 text-xs font-normal text-fog">
                      (excl. delivery)
                    </span>
                  ) : null}
                </dt>
                <dd
                  className={`text-right font-semibold wrap-break-word text-lg tabular-nums sm:text-xl ${
                    deliveryArea ? "text-brand" : "text-smoke"
                  }`}
                >
                  ৳{total.toLocaleString()}
                </dd>
              </div>
            </dl>
          </section>

          {/* Shipping + payment form */}
          <DeliveryDetailsForm
            onSubmit={handleSubmit}
            name={name}
            setName={setName}
            phone={phone}
            setPhone={setPhone}
            address={address}
            setAddress={setAddress}
            deliveryArea={deliveryArea}
            setDeliveryArea={setDeliveryArea}
            notes={notes}
            setNotes={setNotes}
            errors={errors}
            touched={touched}
            submitError={submitError}
            submitting={submitting}
            submitDisabled={!baseValid || submitting}
            submitLabel={`Place order · ৳${total.toLocaleString()}`}
          />
        </div>
      </div>
    </main>
  );
}
