"use client";
import { X } from "lucide-react";
import { Input, Label, TextArea, TextField } from "@heroui/react";
import { useEffect, useRef, useState } from "react";

export const MAX_IMAGES = 4;

const inputClassName =
  "w-full rounded-xl border border-[#E5E5E5] bg-white px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#8A8A8A] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
const labelClassName = "text-sm font-medium text-[#1A1A1A]";

const fileKey = (f) => `${f.name}-${f.size}-${f.lastModified}`;

const toMaterialsString = (materials) =>
  Array.isArray(materials) ? materials.filter(Boolean).join(", ") : (materials ?? "");


export function ProductForm({
  formId,
  initialValues = {},
  existingImages = [],
  imagesRequired = true,
  isPending = false,
  error = null,
  onSubmit,
  imageInputId = "product-image",
}) {
  const [files, setFiles] = useState([]); // File[] (max 4 total with kept)
  const [previews, setPreviews] = useState([]); // object URLs, same order as files
  const [keptExisting, setKeptExisting] = useState(existingImages);

  const inputRef = useRef(null);
  const previewsRef = useRef([]);

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);
  useEffect(() => {
    return () => previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const syncInput = (list) => {
    const input = inputRef.current;
    if (!input) return;
    const dt = new DataTransfer();
    list.forEach((f) => dt.items.add(f));
    input.files = dt.files;
  };

  const applyFiles = (nextFiles) => {
    previews.forEach((url) => URL.revokeObjectURL(url));
    setFiles(nextFiles);
    setPreviews(nextFiles.map((f) => URL.createObjectURL(f)));
    syncInput(nextFiles);
  };

  const handleImageChange = (e) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) {
      syncInput(files);
      return;
    }

    const existing = new Set(files.map(fileKey));
    const fresh = picked.filter((f) => !existing.has(fileKey(f)));
    applyFiles([...files, ...fresh].slice(0, MAX_IMAGES - keptExisting.length));
  };

  const handleRemoveNewImage = (index) => {
    applyFiles(files.filter((_, i) => i !== index));
  };

  const handleRemoveExisting = (index) => {
    setKeptExisting((prev) => prev.filter((_, i) => i !== index));
  };

  const totalImages = keptExisting.length + previews.length;
  const isFull = totalImages >= MAX_IMAGES;

  return (
    <form id={formId} onSubmit={onSubmit} className="flex flex-col gap-5">
      <input
        type="hidden"
        name="keptImages"
        value={JSON.stringify(keptExisting)}
        readOnly
      />

      <TextField
        className="flex w-full flex-col gap-1.5"
        name="name"
        defaultValue={initialValues.name ?? ""}
        isRequired
      >
        <Label className={labelClassName}>Name</Label>
        <Input
          placeholder="e.g. Handwoven Jute Basket"
          className={inputClassName}
        />
      </TextField>

      <TextField
        className="flex w-full flex-col gap-1.5"
        name="description"
        defaultValue={initialValues.description ?? ""}
        isRequired
      >
        <Label className={labelClassName}>Description</Label>
        <TextArea
          placeholder="Describe the product"
          rows={3}
          className={`${inputClassName} min-h-24 resize-y`}
        />
      </TextField>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor={imageInputId} className={labelClassName}>
            Images
          </Label>
          <span className="text-xs text-fog">
            Up to {MAX_IMAGES} · {totalImages}/{MAX_IMAGES} selected
          </span>
        </div>

        <input
          ref={inputRef}
          id={imageInputId}
          name="images"
          type="file"
          accept="image/*"
          multiple
          required={imagesRequired && keptExisting.length === 0}
          tabIndex={isFull ? -1 : 0}
          aria-disabled={isFull}
          onChange={handleImageChange}
          className={`block w-full cursor-pointer rounded-xl border border-dashed border-line bg-white p-2 text-sm text-ink file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-xs file:font-semibold file:tracking-widest file:text-white file:transition-colors hover:file:bg-brand ${
            isFull ? "pointer-events-none opacity-60" : ""
          }`}
        />
        <p className="text-xs text-fog">
          {isFull
            ? "Maximum reached. Remove an image to add another."
            : "The first image is used as the cover."}
        </p>

        {keptExisting.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-line bg-white p-2">
            {keptExisting.map((src, index) => (
              <div key={src} className="relative">
                <img
                  src={src}
                  alt={`Current product image ${index + 1}`}
                  className="h-28 w-full rounded-lg object-cover"
                />
                {index === 0 && previews.length === 0 && (
                  <span className="absolute top-2 left-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold tracking-widest text-white uppercase">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveExisting(index)}
                  disabled={isPending}
                  aria-label={`Remove current image ${index + 1}`}
                  className="absolute top-2 right-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {previews.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-line bg-white p-2">
            {previews.map((src, index) => (
              <div key={src} className="relative">
                <img
                  src={src}
                  alt={`New product preview ${index + 1}`}
                  className="h-28 w-full rounded-lg object-cover"
                />
                {keptExisting.length === 0 && index === 0 && (
                  <span className="absolute top-2 left-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold tracking-widest text-white uppercase">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveNewImage(index)}
                  disabled={isPending}
                  aria-label={`Remove new image ${index + 1}`}
                  className="absolute top-2 right-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <TextField
        className="flex w-full flex-col gap-1.5"
        name="materials"
        defaultValue={toMaterialsString(initialValues.materials)}
        isRequired
      >
        <Label className={labelClassName}>Materials</Label>
        <Input
          placeholder="e.g. Jute, Cotton, Bamboo (comma separated)"
          className={inputClassName}
        />
      </TextField>

      <div className="flex flex-col gap-2">
        <TextField
          className="flex w-full flex-col gap-1.5"
          name="category"
          defaultValue={initialValues.category ?? ""}
          isRequired
        >
          <Label className={labelClassName}>Category</Label>
          <Input
            placeholder="e.g. Baskets, Home Decor, Hanging Swing Chairs etc."
            className={inputClassName}
          />
        </TextField>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField
          className="flex w-full flex-col gap-1.5"
          name="price"
          type="number"
          defaultValue={
            initialValues.price === undefined || initialValues.price === null
              ? ""
              : String(initialValues.price)
          }
          isRequired
        >
          <Label className={labelClassName}>Price (৳)</Label>
          <Input
            placeholder="e.g. 12,500"
            min="0"
            step="1"
            className={inputClassName}
          />
        </TextField>

        <TextField
          className="flex w-full flex-col gap-1.5"
          name="stock"
          type="number"
          defaultValue={
            initialValues.stock === undefined || initialValues.stock === null
              ? ""
              : String(initialValues.stock)
          }
          isRequired
        >
          <Label className={labelClassName}>Stock</Label>
          <Input
            placeholder="0"
            min="0"
            step="1"
            className={inputClassName}
          />
        </TextField>
      </div>

      {error && (
        <p className="text-sm text-brand" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
