export const imageUpload = async (image) => {
  if (!(image instanceof File) || image.size === 0) {
    throw new Error("Please choose an image to upload.");
  }

  const formData = new FormData();
  formData.append("image", image, image.name || "image");

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const result = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(result?.error || `Image upload failed: ${res.status}`);
  }
  if (!result?.url) {
    throw new Error("Image upload failed: missing URL");
  }

  return result;
};
