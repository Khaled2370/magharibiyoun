import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type UploadedImage = { url: string; width: number; height: number };

export async function uploadImage(file: File): Promise<UploadedImage> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("نوع الملف غير مدعوم — يُقبل JPEG وPNG وWebP وGIF فقط.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("حجم الصورة يتجاوز 8 ميغابايت.");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(base64, {
    folder: "magharibiyoun",
    resource_type: "image",
  });
  return { url: result.secure_url, width: result.width, height: result.height };
}
