import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_PDF_BYTES = 20 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type UploadedImage = { url: string; width: number; height: number };
export type UploadedDocument = { url: string; bytes: number };

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

// PDF des séances.
// Vérifié sur le compte Cloudinary du projet (2026-09-04) : la livraison des PDF
// est désactivée pour ce compte, et le blocage se déclenche sur l'EXTENSION de
// l'URL — toute URL finissant par ".pdf" renvoie 401, que le fichier soit envoyé
// en resource_type "image" ou "raw". En revanche un envoi "raw" avec un public_id
// SANS extension est servi normalement (200, octets identiques, CORS "*",
// Accept-Ranges), ce qui est exactement ce dont pdf.js a besoin pour l'afficher
// dans le lecteur intégré. D'où le public_id délibérément sans ".pdf".
export async function uploadDocument(file: File): Promise<UploadedDocument> {
  if (file.type !== "application/pdf") {
    throw new Error("نوع الملف غير مدعوم — يُقبل PDF فقط.");
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new Error("حجم الملف يتجاوز 20 ميغابايت.");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(base64, {
    folder: "magharibiyoun/documents",
    resource_type: "raw",
    public_id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  });
  return { url: result.secure_url, bytes: result.bytes };
}
