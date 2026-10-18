"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Modal } from "@heroui/react";
import { Package, Pencil, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { ORDER_STATUSES } from "@/lib/order-statuses";
import { updateOrder } from "@/lib/actions/orders";
import { getAdminProducts, getProductsByIds } from "@/lib/actions/products";

const MAX_NOTE_LENGTH = 500;
const MAX_SIZE_LENGTH = 16;
const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_RESULT_LIMIT = 8;
const MIN_SEARCH_LENGTH = 2;

const statusStyles = {
  pending: "bg-stone-200 text-stone-700",
  confirmed: "bg-amber-100 text-amber-800",
  shipped: "bg-sky-100 text-sky-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const inputClassName =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-fog outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60";

const labelClassName =
  "mb-1.5 block text-xs font-semibold tracking-[0.08em] text-smoke uppercase";

const toAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const normalizeSizes = (product) =>
  Array.isArray(product?.sizes)
    ? product.sizes.map((entry) => String(entry ?? "").trim()).filter(Boolean)
    : [];

const buildEditableItems = (order) =>
  (Array.isArray(order?.items) ? order.items : []).map((item, index) => ({
    key: `${String(item?.productId ?? "")}-${index}`,
    productId: String(item?.productId ?? ""),
    title: item?.title || "Untitled product",
    image: item?.image || "",
    unitPrice: toAmount(item?.unitPrice),
    quantity: String(Math.max(1, Math.floor(toAmount(item?.quantity)) || 1)),
    size: typeof item?.size === "string" ? item.size : "",
    sizes: [],
    isNew: false,
  }));

export function OrderEditModal({ order, isOpen, onOpenChange }) {
  const router = useRouter();
  const [customer, setCustomer] = useState(() => ({
    name: order?.customer?.name ?? "",
    phone: order?.customer?.phone ?? "",
    address: order?.customer?.address ?? "",
  }));
  const [items, setItems] = useState(() => buildEditableItems(order));
  const [deliveryCharge, setDeliveryCharge] = useState(() =>
    String(toAmount(order?.deliveryCharge)),
  );
  const [note, setNote] = useState(() => (typeof order?.note === "string" ? order.note : ""));
  const [status, setStatus] = useState(() => order?.orderStatus ?? "pending");
  const [totalOverride, setTotalOverride] = useState(() =>
    order?.totalOverridden ? String(toAmount(order?.totalAmount)) : null,
  );
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const searchTimerRef = useRef(null);
  const searchRequestRef = useRef(0);

  const orderId = order ? String(order._id) : "";

  // Pull live catalog data (sizes) for products already on the order.
  useEffect(() => {
    if (!order) return undefined;
    const ids = [...new Set(buildEditableItems(order).map((item) => item.productId).filter(Boolean))];
    if (ids.length === 0) return undefined;
    let cancelled = false;
    getProductsByIds(ids)
      .then((products) => {
        if (cancelled) return;
        const byId = new Map(products.map((product) => [String(product._id), product]));
        setItems((current) =>
          current.map((item) => {
            const product = byId.get(item.productId);
            if (!product) return item;
            return {
              ...item,
              sizes: normalizeSizes(product),
              title: item.title || product.title || product.name || "Untitled product",
              image: item.image || product.image || "",
            };
          }),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [order]);

  // Debounced product search for adding items.
  useEffect(() => {
    const text = searchText.trim();
    if (text.length < MIN_SEARCH_LENGTH) return undefined;
    const requestId = searchRequestRef.current + 1;
    searchRequestRef.current = requestId;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const data = await getAdminProducts(text, { page: 1, limit: SEARCH_RESULT_LIMIT });
        if (searchRequestRef.current !== requestId) return;
        const list = Array.isArray(data?.products) ? data.products : Array.isArray(data) ? data : [];
        setSearchResults(list);
        setSearchError("");
      } catch (err) {
        if (searchRequestRef.current !== requestId) return;
        setSearchResults([]);
        setSearchError(err?.message || "Product search failed.");
      } finally {
        if (searchRequestRef.current === requestId) setIsSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchText]);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.unitPrice * Math.max(0, Math.floor(toAmount(item.quantity))),
        0,
      ),
    [items],
  );
  const chargeValue = Number(deliveryCharge);
  const safeDelivery = Number.isFinite(chargeValue) && chargeValue >= 0 ? chargeValue : 0;
  const calculatedTotal = subtotal + safeDelivery;
  const overrideText = totalOverride === null ? "" : String(totalOverride).trim();
  const parsedOverride = overrideText === "" ? null : Number(overrideText);
  const overrideInvalid =
    totalOverride !== null &&
    (parsedOverride === null || !Number.isFinite(parsedOverride) || parsedOverride < 0);
  const effectiveTotal = overrideInvalid ? calculatedTotal : (parsedOverride ?? calculatedTotal);
  const isAdjusted =
    !overrideInvalid && parsedOverride !== null && Math.abs(parsedOverride - calculatedTotal) > 0.009;

  if (!order) return null;

  const handleOpenChange = (open) => {
    if (!isPending) {
      if (!open) {
        setError(null);
        setSearchText("");
        setSearchResults([]);
        setSearchError("");
        setIsSearching(false);
        searchRequestRef.current += 1;
      }
      onOpenChange(open);
    }
  };

  const updateItem = (key, patch) => {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  };

  const removeItem = (key) => {
    setItems((current) => current.filter((item) => item.key !== key));
  };

  const addProduct = (product) => {
    const productId = String(product?._id ?? "").trim();
    if (!productId) return;
    setItems((current) => {
      const existingIndex = current.findIndex((item) => item.productId === productId);
      if (existingIndex >= 0) {
        const next = [...current];
        const existing = next[existingIndex];
        next[existingIndex] = {
          ...existing,
          quantity: String(Math.max(0, Math.floor(toAmount(existing.quantity))) + 1),
        };
        return next;
      }
      const sizes = normalizeSizes(product);
      return [
        ...current,
        {
          key: `${productId}-${Date.now()}`,
          productId,
          title: product.title || product.name || "Untitled product",
          image: product.image || "",
          unitPrice: toAmount(product.price),
          quantity: "1",
          size: sizes.length === 1 ? sizes[0] : "",
          sizes,
          isNew: true,
        },
      ];
    });
  };

  const handleSearchChange = (value) => {
    setSearchText(value);
    const text = value.trim();
    if (text.length < MIN_SEARCH_LENGTH) {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchRequestRef.current += 1;
      setSearchResults([]);
      setSearchError("");
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
  };

  const handleSave = async () => {
    if (isPending) return;
    setError(null);

    const name = customer.name.trim();
    const phone = customer.phone.trim();
    const address = customer.address.trim();
    if (!name) {
      setError("Customer name is required.");
      return;
    }
    if (!phone) {
      setError("Customer phone is required.");
      return;
    }
    if (!address) {
      setError("Customer address is required.");
      return;
    }

    if (items.length === 0) {
      setError("An order needs at least one item.");
      return;
    }
    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        setError(`Quantity for "${item.title}" must be a positive whole number.`);
        return;
      }
      if (item.isNew && item.sizes.length > 0 && !item.size.trim()) {
        setError(`Select a size for "${item.title}".`);
        return;
      }
      if (item.size.trim().length > MAX_SIZE_LENGTH) {
        setError(`Size for "${item.title}" must be at most ${MAX_SIZE_LENGTH} characters.`);
        return;
      }
    }

    const charge = Number(deliveryCharge);
    if (!Number.isFinite(charge) || charge < 0) {
      setError("Delivery charge must be a number of 0 or more.");
      return;
    }

    if (totalOverride !== null && overrideInvalid) {
      setError("Total must be a number of 0 or more.");
      return;
    }

    if (note.trim().length > MAX_NOTE_LENGTH) {
      setError(`Note must be at most ${MAX_NOTE_LENGTH} characters.`);
      return;
    }

    setIsPending(true);
    try {
      await updateOrder(orderId, {
        customer: { name, phone, address },
        items: items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          size: item.size.trim(),
        })),
        deliveryCharge: charge,
        totalAmount: effectiveTotal,
        note: note.trim(),
        orderStatus: status,
      });
      toast.success("Order updated successfully!");
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err?.message || "Couldn't update the order. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const placedDate = order.createdAt ? new Date(order.createdAt) : null;
  const placedText =
    placedDate && !Number.isNaN(placedDate.getTime())
      ? `${placedDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} at ${placedDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
      : "—";

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        className="bg-black/40 backdrop-blur-sm"
      >
        <Modal.Container placement="auto">
          <Modal.Dialog className="max-h-[90vh] overflow-y-auto rounded-2xl border border-line bg-white shadow-xl shadow-black/10 sm:max-w-2xl">
            <Modal.CloseTrigger className="rounded-full text-fog transition-colors hover:bg-mist hover:text-ink" />

            <Modal.Header className="border-b border-line px-6 py-5">
              <p className="text-[11px] font-semibold tracking-[0.15em] text-brand uppercase">
                Order #{orderId.slice(-6).toUpperCase()}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Modal.Icon className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <Pencil className="size-5" strokeWidth={1.75} />
                </Modal.Icon>
                <Modal.Heading className="font-serif text-2xl text-ink">
                  Edit order
                </Modal.Heading>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.orderStatus] ?? statusStyles.pending}`}
                >
                  {order.orderStatus}
                </span>
              </div>
              <p className="mt-2 text-sm leading-5 text-smoke font-semibold">
                Placed on {placedText}
              </p>
            </Modal.Header>

            <Modal.Body className="space-y-6 bg-white px-6 py-5">
              <section aria-label="Customer">
                <h4 className="text-xs font-semibold tracking-[0.12em] text-fog uppercase">
                  Customer
                </h4>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`order-edit-name-${orderId}`} className={labelClassName}>
                      Name
                    </label>
                    <input
                      id={`order-edit-name-${orderId}`}
                      value={customer.name}
                      onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
                      disabled={isPending}
                      autoComplete="off"
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label htmlFor={`order-edit-phone-${orderId}`} className={labelClassName}>
                      Phone
                    </label>
                    <input
                      id={`order-edit-phone-${orderId}`}
                      value={customer.phone}
                      onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
                      disabled={isPending}
                      autoComplete="off"
                      inputMode="tel"
                      className={inputClassName}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor={`order-edit-address-${orderId}`} className={labelClassName}>
                      Address
                    </label>
                    <input
                      id={`order-edit-address-${orderId}`}
                      value={customer.address}
                      onChange={(e) => setCustomer((c) => ({ ...c, address: e.target.value }))}
                      disabled={isPending}
                      autoComplete="off"
                      className={inputClassName}
                    />
                  </div>
                </div>
              </section>

              <section aria-label="Items">
                <h4 className="text-xs font-semibold tracking-[0.12em] text-fog uppercase">
                  Items ({items.length})
                </h4>
                <ul className="mt-3 space-y-3">
                  {items.length === 0 ? (
                    <li className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-smoke">
                      No items. Search below to add products.
                    </li>
                  ) : null}
                  {items.map((item) => {
                    const catalogSizes = Array.isArray(item.sizes) ? item.sizes : [];
                    const lineTotal =
                      item.unitPrice * Math.max(0, Math.floor(toAmount(item.quantity)));
                    return (
                      <li key={item.key} className="rounded-xl border border-line bg-white p-3">
                        <div className="flex items-start gap-3">
                          {item.image ? (
                            <Image
                              height={48}
                              width={48}
                              unoptimized
                              src={item.image}
                              alt={item.title}
                              className="h-12 w-12 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-mist text-fog">
                              <Package size={18} strokeWidth={1.75} />
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                            <p className="text-xs text-smoke">
                              ৳{item.unitPrice.toLocaleString()} each
                            </p>
                            <div className="mt-2 flex flex-wrap items-start gap-3">
                              <div className="flex flex-col">
                                <label
                                  htmlFor={`size-${item.key}`}
                                  className="mb-1 block text-[10px] font-semibold tracking-[0.08em] text-fog uppercase"
                                >
                                  Size <span className="sr-only">for {item.title}</span>
                                </label>
                                <input
                                  id={`size-${item.key}`}
                                  value={item.size}
                                  onChange={(e) => updateItem(item.key, { size: e.target.value })}
                                  maxLength={MAX_SIZE_LENGTH}
                                  placeholder="Optional"
                                  disabled={isPending}
                                  autoComplete="off"
                                  className="w-36 rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-fog outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
                                />
                              </div>
                              <div className="flex flex-col">
                                <label
                                  htmlFor={`qty-${item.key}`}
                                  className="mb-1 block text-[10px] font-semibold tracking-[0.08em] text-fog uppercase"
                                >
                                  Qty <span className="sr-only">for {item.title}</span>
                                </label>
                                <input
                                  id={`qty-${item.key}`}
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(item.key, { quantity: e.target.value })}
                                  disabled={isPending}
                                  className="w-20 rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
                                />
                              </div>
                            </div>
                            {catalogSizes.length > 0 ? (
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                {catalogSizes.map((size) => {
                                  const isActive = item.size.trim() === size;
                                  return (
                                    <button
                                      key={size}
                                      type="button"
                                      onClick={() => updateItem(item.key, { size })}
                                      disabled={isPending}
                                      aria-pressed={isActive}
                                      className={`cursor-pointer rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-60 ${
                                        isActive
                                          ? "border-brand bg-brand text-white"
                                          : "border-line bg-white text-smoke hover:border-brand hover:bg-brand-soft hover:text-brand"
                                      }`}
                                    >
                                      {size}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-2">
                            <p className="text-sm font-semibold text-ink">
                              ৳{lineTotal.toLocaleString()}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeItem(item.key)}
                              disabled={isPending}
                              aria-label={`Remove ${item.title} from order`}
                              title="Remove item"
                              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-fog transition-colors outline-none hover:bg-red-50 hover:text-brand focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Trash2 size={15} strokeWidth={1.75} />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-3 rounded-xl border border-dashed border-line bg-[#FAFAFA] p-3">
                  <label htmlFor="order-edit-product-search" className="sr-only">
                    Search products to add
                  </label>
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fog"
                      aria-hidden="true"
                    />
                    <input
                      id="order-edit-product-search"
                      value={searchText}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search products to add…"
                      autoComplete="off"
                      disabled={isPending}
                      className="w-full rounded-xl border border-line bg-white py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-fog outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
                    />
                  </div>
                  {searchText.trim().length < MIN_SEARCH_LENGTH ? (
                    <p className="mt-2 text-xs text-fog">
                      Type at least {MIN_SEARCH_LENGTH} characters to search the catalog.
                    </p>
                  ) : isSearching ? (
                    <p className="mt-2 text-xs text-fog">Searching…</p>
                  ) : searchError ? (
                    <p role="alert" className="mt-2 text-xs text-brand">
                      {searchError}
                    </p>
                  ) : searchResults.length === 0 ? (
                    <p className="mt-2 text-xs text-fog">No products found.</p>
                  ) : (
                    <ul className="mt-2 max-h-52 space-y-1 overflow-y-auto">
                      {searchResults.map((product) => {
                        const productId = String(product._id);
                        const alreadyAdded = items.some((item) => item.productId === productId);
                        return (
                          <li key={productId}>
                            <button
                              type="button"
                              onClick={() => addProduct(product)}
                              disabled={isPending}
                              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors outline-none hover:bg-brand-soft focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {product.image ? (
                                <Image
                                  height={36}
                                  width={36}
                                  unoptimized
                                  src={product.image}
                                  alt={product.title || product.name || "Product"}
                                  className="h-9 w-9 shrink-0 rounded-lg object-cover"
                                />
                              ) : (
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mist text-fog">
                                  <Package size={16} strokeWidth={1.75} />
                                </span>
                              )}
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-ink">
                                  {product.title || product.name || "Untitled product"}
                                </span>
                                <span className="block text-xs text-smoke">
                                  ৳{toAmount(product.price).toLocaleString()} · stock{" "}
                                  {Number(product.stock ?? 0)}
                                </span>
                              </span>
                              <span className="shrink-0 text-[11px] font-semibold tracking-[0.08em] text-brand">
                                {alreadyAdded ? "+1 QTY" : "ADD"}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <p className="mt-2 text-xs text-fog">
                  Items already in the order keep their original unit price; products added now use
                  the current catalog price.
                </p>
              </section>

              <section aria-label="Order settings" className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={`order-edit-delivery-${orderId}`}
                    className={labelClassName}
                  >
                    Delivery charge
                  </label>
                  <input
                    id={`order-edit-delivery-${orderId}`}
                    type="number"
                    min="0"
                    step="1"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(e.target.value)}
                    disabled={isPending}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label htmlFor={`order-edit-status-${orderId}`} className={labelClassName}>
                    Order status
                  </label>
                  <select
                    id={`order-edit-status-${orderId}`}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={isPending}
                    className={inputClassName}
                  >
                    {ORDER_STATUSES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor={`order-edit-note-${orderId}`} className={labelClassName}>
                    Note
                  </label>
                  <textarea
                    id={`order-edit-note-${orderId}`}
                    rows={3}
                    maxLength={MAX_NOTE_LENGTH}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={isPending}
                    placeholder="Delivery instructions, special requests…"
                    className={`${inputClassName} resize-y`}
                  />
                  <p className="mt-1 text-right text-xs text-fog">
                    {note.length}/{MAX_NOTE_LENGTH}
                  </p>
                </div>
              </section>

              <dl className="space-y-2 rounded-xl bg-[#FAFAFA] p-4 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-smoke">Subtotal</dt>
                  <dd className="font-semibold">৳{subtotal.toLocaleString()}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-smoke">Delivery</dt>
                  <dd className="font-semibold">৳{safeDelivery.toLocaleString()}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-line pt-2">
                  <dt className="text-base font-semibold">
                    <label htmlFor={`order-edit-total-${orderId}`}>Total</label>
                  </dt>
                  <dd className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-smoke">৳</span>
                    <input
                      id={`order-edit-total-${orderId}`}
                      type="number"
                      min="0"
                      step="1"
                      value={totalOverride ?? String(calculatedTotal)}
                      onChange={(e) => setTotalOverride(e.target.value)}
                      disabled={isPending}
                      className="w-32 rounded-xl border border-line bg-white px-3 py-2 text-right text-base font-semibold text-brand outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
                    />
                  </dd>
                </div>
              </dl>
              {totalOverride !== null && overrideInvalid ? (
                <p role="alert" className="flex justify-end text-xs text-brand">
                  Enter a valid total of ৳0 or more.
                </p>
              ) : isAdjusted ? (
                <p className="flex flex-wrap items-center justify-end gap-2 text-xs text-fog">
                  <span>Adjusted from ৳{calculatedTotal.toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => setTotalOverride(null)}
                    disabled={isPending}
                    className="cursor-pointer font-semibold text-brand underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reset
                  </button>
                </p>
              ) : null}
            </Modal.Body>

            <Modal.Footer className="border-t border-line bg-[#FAFAFA] px-6 py-4">
              {error ? (
                <p role="alert" className="mr-auto text-sm text-brand">
                  {error}
                </p>
              ) : null}
              <Button
                onPress={() => handleOpenChange(false)}
                isDisabled={isPending}
                className="cursor-pointer rounded-full border border-line bg-transparent px-4 py-2 text-xs font-semibold tracking-[0.12em] text-[#1A1A1A] transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
              >
                CANCEL
              </Button>
              <Button
                onPress={handleSave}
                isPending={isPending}
                className="cursor-pointer rounded-full bg-brand px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "SAVING…" : "SAVE CHANGES"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
