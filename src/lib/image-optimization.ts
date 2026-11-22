"use client";

const MAX_STORED_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1_600;

export async function optimizeProductImage(file: File): Promise<File> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPG, PNG or WebP image.");
  }
  if (file.size < 1 || file.size > 10 * 1024 * 1024) {
    throw new Error("Choose an image smaller than 10 MB.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This image could not be opened. Try a different JPG, PNG or WebP file.");
  }

  try {
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser could not prepare the image. Try another browser.");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const optimized = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", 0.82);
    });
    if (!optimized || optimized.type !== "image/webp") {
      throw new Error("This browser could not encode WebP images. Try a current browser.");
    }
    if (optimized.size > MAX_STORED_IMAGE_BYTES) {
      throw new Error("The optimized image is still larger than 3 MB. Choose a smaller image.");
    }
    return new File([optimized], "product-image.webp", { type: "image/webp" });
  } finally {
    bitmap.close();
  }
}
