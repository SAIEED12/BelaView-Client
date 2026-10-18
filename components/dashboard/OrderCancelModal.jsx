"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Modal } from "@heroui/react";
import { Ban } from "lucide-react";
import { cancelOrder } from "@/lib/actions/orders";
import { toUserMessage } from "@/lib/error-message";

export function OrderCancelModal({ order, isOpen, onOpenChange }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  if (!order) return null;

  const orderId = String(order._id);

  const handleOpenChange = (open) => {
    if (!isPending) {
      if (!open) setError(null);
      onOpenChange(open);
    }
  };

  const handleConfirm = async () => {
    setError(null);
    setIsPending(true);
    try {
      const res = await cancelOrder(orderId);
      if (res?.ok === false) {
        setError(res.error);
        return;
      }
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(toUserMessage(err, "Couldn't cancel the order. Please try again."));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        className="bg-black/40 backdrop-blur-sm"
      >
        <Modal.Container placement="auto">
          <Modal.Dialog className="rounded-2xl border border-[#E5E5E5] bg-white shadow-xl shadow-black/10 sm:max-w-md">
            <Modal.CloseTrigger className="rounded-full text-[#8A8A8A] transition-colors hover:bg-[#F5F5F5] hover:text-[#1A1A1A]" />

            <Modal.Header className="border-b border-[#E5E5E5] px-6 py-5">
              <div className="flex items-center gap-3">
                <Modal.Icon className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <Ban className="size-5" strokeWidth={1.75} />
                </Modal.Icon>
                <Modal.Heading className="font-serif text-2xl text-[#1A1A1A]">
                  Cancel order
                </Modal.Heading>
              </div>
              <p className="mt-2 text-sm leading-5 text-[#525252]">
                Cancel order{" "}
                <span className="font-semibold text-[#1A1A1A]">
                  #{orderId.slice(-6).toUpperCase()}
                </span>{" "}
                for {order.customer?.name ?? "this customer"} (৳
                {Number(order.totalAmount ?? 0).toLocaleString()})? Ordered stock
                will be restored. This cannot be undone.
              </p>
            </Modal.Header>

            <Modal.Footer className="border-t border-[#E5E5E5] bg-[#FAFAFA] px-6 py-4">
              {error && (
                <p className="mr-auto text-sm text-brand" role="alert">
                  {error}
                </p>
              )}
              <Button
                onPress={() => handleOpenChange(false)}
                isDisabled={isPending}
                className="cursor-pointer rounded-full border border-[#E5E5E5] bg-transparent px-4 py-2 text-xs font-semibold tracking-[0.12em] text-[#1A1A1A] transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
              >
                KEEP ORDER
              </Button>
              <Button
                onPress={handleConfirm}
                isPending={isPending}
                className="cursor-pointer rounded-full bg-brand px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "CANCELLING…" : "CANCEL ORDER"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
