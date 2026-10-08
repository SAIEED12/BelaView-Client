"use client";
import { Package, Plus } from "lucide-react";
import { Button, Modal } from "@heroui/react";
import { addProduct } from "@/lib/actions/products";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { imageUpload } from "@/lib/imageUpload";
import { MAX_IMAGES, ProductForm } from "./ProductForm";
import { DEFAULT_POLICIES } from "@/lib/productPolicies";
import toast from "react-hot-toast";

export function AddProductModal({ categories = [] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const [formKey, setFormKey] = useState(0);

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      setError(null);
      // Remount ProductForm to clear picked files/previews.
      setFormKey((k) => k + 1);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formdata = new FormData(form);
    const { keptImages, ...data } = Object.fromEntries(formdata.entries());

    const imageFiles = formdata
      .getAll("images")
      .filter((f) => f instanceof File && f.size > 0);

    if (imageFiles.length < 1) {
      setError("Select at least 1 image.");
      return;
    }
    if (imageFiles.length > MAX_IMAGES) {
      setError(`You can upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    setIsPending(true);
    try {
      let urls;
      try {
        const uploaded = await Promise.all(
          imageFiles.map((file) => imageUpload(file)),
        );
        urls = uploaded.map((u) => u?.url ?? "");
        if (urls.some((url) => !url)) throw new Error("Missing image URL");
      } catch (err) {
        console.error("Image upload failed:", err);
        setError("Image upload failed. Please try again.");
        return;
      }

      try {
        await addProduct({ ...data, image: urls[0], images: urls });
      } catch (err) {
        console.error("Add product failed:", err);
        setError(err?.message || "Couldn't save the product. Please try again.");
        return;
      }

       toast.success("Product added successfully!", { duration: 5000 });

              form.reset();
              setIsOpen(false);
              setFormKey((k) => k + 1);
              router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Modal>
      <Button
        onPress={() => setIsOpen(true)}
        className="flex cursor-pointer items-center gap-2 rounded-full bg-[#1A1A1A] px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white transition-colors hover:bg-brand"
      >
        <Plus size={15} strokeWidth={2} />
        ADD PRODUCT
      </Button>

      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        className="bg-black/40 backdrop-blur-sm"
      >
        <Modal.Container placement="auto">
          <Modal.Dialog className="max-h-[90vh] overflow-y-auto rounded-2xl border border-[#E5E5E5] bg-white shadow-xl shadow-black/10 sm:max-w-lg">
            <Modal.CloseTrigger className="rounded-full text-[#8A8A8A] transition-colors hover:bg-[#F5F5F5] hover:text-[#1A1A1A]" />

            <Modal.Header className="border-b border-[#E5E5E5] px-6 py-5">
              <p className="text-[11px] font-semibold tracking-[0.15em] text-brand uppercase">
                New listing
              </p>
              <div className="mt-2 flex items-center gap-3">
                <Modal.Icon className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <Package className="size-5" strokeWidth={1.75} />
                </Modal.Icon>
                <Modal.Heading className="font-serif text-2xl text-[#1A1A1A]">
                  Add a product
                </Modal.Heading>
              </div>
              <p className="mt-2 text-sm leading-5 text-[#525252]">
                Enter the product details below to add it to your catalog.
              </p>
            </Modal.Header>

            <Modal.Body className="bg-white px-6 py-5">
              <ProductForm
                key={formKey}
                formId="add-product-form"
                imagesRequired
                isPending={isPending}
                error={error}
                categories={categories}
                policyDefaults={DEFAULT_POLICIES}
                onSubmit={onSubmit}
              />
            </Modal.Body>

            <Modal.Footer className="border-t border-[#E5E5E5] bg-[#FAFAFA] px-6 py-4">
              <Button
                onPress={() => handleOpenChange(false)}
                isDisabled={isPending}
                className="cursor-pointer rounded-full border border-[#E5E5E5] bg-transparent px-4 py-2 text-xs font-semibold tracking-[0.12em] text-[#1A1A1A] transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
              >
                CANCEL
              </Button>
              <Button
                type="submit"
                form="add-product-form"
                isPending={isPending}
                className="cursor-pointer rounded-full bg-brand px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "ADDING…" : "ADD PRODUCT"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
