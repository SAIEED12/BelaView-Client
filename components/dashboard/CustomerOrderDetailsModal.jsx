"use client";

import Image from "next/image";
import { Button, Modal } from "@heroui/react";
import { Package } from "lucide-react";

const statusStyles = {
  pending: "bg-stone-200 text-stone-700",
  confirmed: "bg-amber-100 text-amber-800",
  shipped: "bg-sky-100 text-sky-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function CustomerOrderDetailsModal({ order, isOpen, onOpenChange }) {
  if (!order) return null;

  const orderId = String(order._id);

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="bg-black/40 backdrop-blur-sm"
      >
        <Modal.Container placement="auto">
          <Modal.Dialog className="max-h-[90vh] overflow-y-auto rounded-2xl border border-line bg-white shadow-xl shadow-black/10 sm:max-w-lg">
            <Modal.CloseTrigger className="rounded-full text-fog transition-colors hover:bg-mist hover:text-ink" />

            <Modal.Header className="border-b border-line px-6 py-5">
              <p className="text-[11px] font-semibold tracking-[0.15em] text-brand uppercase">
                Order #{orderId.slice(-6).toUpperCase()}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Modal.Icon className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <Package className="size-5" strokeWidth={1.75} />
                </Modal.Icon>
                <Modal.Heading className="font-serif text-2xl text-ink">
                  Order details
                </Modal.Heading>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.orderStatus] ?? statusStyles.pending}`}
                >
                  {order.orderStatus}
                </span>
              </div>
              <p className="mt-2 text-sm leading-5 text-smoke font-semibold">
                Placed on {formatDate(order.createdAt)} at {new Date(order.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </Modal.Header>

            <Modal.Body className="space-y-5 bg-white px-6 py-5">
              <section aria-label="Delivery">
                <h4 className="text-xs font-semibold tracking-[0.12em] text-fog uppercase">
                  Delivery
                </h4>
                <p className="mt-2 text-sm font-semibold text-ink">
                  Name: {order.customer?.name ?? "—"}
                </p>
                <p className="mt-0.5 text-sm text-ink font-semibold">
                  Phone: {order.customer?.phone ?? "—"}
                </p>
                <p className="mt-0.5 text-sm text-ink font-semibold">
                  Address: {order.customer?.address ?? "—"}
                </p>
              </section>

              <section aria-label="Items">
                <h4 className="text-xs font-semibold tracking-[0.12em] text-fog uppercase">
                  Items ({order.itemCount ?? order.items?.length ?? 0})
                </h4>
                <ul className="mt-2 space-y-3">
                  {(order.items ?? []).map((item, index) => (
                    <li key={`${item.productId}-${index}`} className="flex items-center gap-3">
                      {item.image ? (
                        <Image
                          height={44}
                          width={44}
                          unoptimized
                          src={item.image}
                          alt={item.title || "Order item"}
                          className="h-11 w-11 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-mist text-fog">
                          <Package size={18} strokeWidth={1.75} />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {item.title || "Untitled product"}
                        </p>
                        <p className="text-xs text-smoke">
                          {item.quantity} × ৳{Number(item.unitPrice ?? 0).toLocaleString()}
                          {item.size ? ` · Size: ${item.size}` : ""}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-ink">
                        ৳{Number(item.subtotal ?? 0).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>

              <dl className="space-y-2 rounded-xl bg-[#FAFAFA] p-4 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-smoke">Subtotal</dt>
                  <dd className="font-semibold">৳{Number(order.subtotal ?? 0).toLocaleString()}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-smoke">Delivery</dt>
                  <dd className="font-semibold">৳{Number(order.deliveryCharge ?? 0).toLocaleString()}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-t border-line pt-2 text-base">
                  <dt className="font-semibold">Total (COD)</dt>
                  <dd className="font-semibold text-brand">
                    ৳{Number(order.totalAmount ?? 0).toLocaleString()}
                  </dd>
                </div>
              </dl>

              {order.note ? (
                <p className="rounded-xl border border-line px-4 py-3 text-sm wrap-break-word text-smoke">
                  <span className="font-semibold text-ink">Note: </span>
                  {order.note}
                </p>
              ) : null}
            </Modal.Body>

            <Modal.Footer className="border-t border-line bg-[#FAFAFA] px-6 py-4">
              <Button
                onPress={() => onOpenChange(false)}
                className="cursor-pointer rounded-full border border-line bg-transparent px-4 py-2 text-xs font-semibold tracking-[0.12em] text-[#1A1A1A] transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
              >
                CLOSE
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
