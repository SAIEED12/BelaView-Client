"use client";
import { Package } from "lucide-react";
import { Button, Modal } from "@heroui/react";
import { updateProduct } from "@/lib/actions/products";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { imageUpload } from "@/lib/imageUpload";
import { MAX_IMAGES, ProductForm } from "./ProductForm";

export function UpdateProductModal({ product, categories = [], isOpen, onOpenChange }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  if (!product) return null;

  const existingImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.filter(Boolean)
      : product.image
        ? [product.image]
        : [];

  const handleOpenChange = (open) => {
    if (!isPending) {
      if (!open) setError(null);
      onOpenChange(open);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formdata = new FormData(form);
    const entries = Object.fromEntries(formdata.entries());
    const { keptImages: keptRaw, ...data } = entries;

    let kept = [];
    try {
      kept = JSON.parse(keptRaw ?? "[]");
    } catch {
      kept = [];
    }

    const imageFiles = formdata
      .getAll("images")
      .filter((f) => f instanceof File && f.size > 0);

    if (kept.length + imageFiles.length < 1) {
      setError("Select at least 1 image.");
      return;
    }
    if (kept.length + imageFiles.length > MAX_IMAGES) {
      setError(`You can upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    setIsPending(true);
    try {
      let urls = [];
      if (imageFiles.length > 0) {
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
      }

      const finalImages = [...kept, ...urls];
      try {
        await updateProduct(String(product._id), {
          ...data,
          image: finalImages[0],
          images: finalImages,
        });
      } catch (err) {
        console.error("Update product failed:", err);
        setError(err?.message || "Couldn't update the product. Please try again.");
        return;
      }

      toast.success("Product updated successfully!", { duration: 5000 });

      onOpenChange(false);
      router.refresh();
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
          <Modal.Dialog className="max-h-[90vh] overflow-y-auto rounded-2xl border border-[#E5E5E5] bg-white shadow-xl shadow-black/10 sm:max-w-lg">
            <Modal.CloseTrigger className="rounded-full text-[#8A8A8A] transition-colors hover:bg-[#F5F5F5] hover:text-[#1A1A1A]" />

            <Modal.Header className="border-b border-[#E5E5E5] px-6 py-5">
              <p className="text-[11px] font-semibold tracking-[0.15em] text-brand uppercase">
                Update listing
              </p>
              <div className="mt-2 flex items-center gap-3">
                <Modal.Icon className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <Package className="size-5" strokeWidth={1.75} />
                </Modal.Icon>
                <Modal.Heading className="font-serif text-2xl text-[#1A1A1A]">
                  Update product
                </Modal.Heading>
              </div>
              <p className="mt-2 text-sm leading-5 text-[#525252]">
                Edit the details below to update this product.
              </p>
            </Modal.Header>

            <Modal.Body className="bg-white px-6 py-5">
              <ProductForm
                key={String(product._id)}
                formId="update-product-form"
                imageInputId="update-product-image"
                initialValues={product}
                existingImages={existingImages}
                imagesRequired={false}
                isPending={isPending}
                error={error}
                categories={categories}
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
                form="update-product-form"
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
