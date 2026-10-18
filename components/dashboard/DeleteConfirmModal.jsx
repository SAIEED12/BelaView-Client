"use client";
import { Trash2 } from "lucide-react";
import { Button, Modal } from "@heroui/react";
import { deleteProduct } from "@/lib/actions/products";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function DeleteConfirmModal({ product, isOpen, onOpenChange }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  if (!product) return null;

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
      const res = await deleteProduct(String(product._id));
      if (res?.ok === false) {
        setError(res.error);
        return;
      }
      toast.success("Product deleted successfully!", { duration: 5000 });
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      console.error("Delete product failed:", err);
      setError("Couldn't delete the product. Please try again.");
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
                  <Trash2 className="size-5" strokeWidth={1.75} />
                </Modal.Icon>
                <Modal.Heading className="font-serif text-2xl text-[#1A1A1A]">
                  Delete product
                </Modal.Heading>
              </div>
              <p className="mt-2 text-sm leading-5 text-[#525252]">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[#1A1A1A]">
                  “{product.name}”
                </span>
                ? This action cannot be undone.
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
                CANCEL
              </Button>
              <Button
                onPress={handleConfirm}
                isPending={isPending}
                className="cursor-pointer rounded-full bg-brand px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "DELETING…" : "DELETE"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
