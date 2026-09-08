"use server";

import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

function assertImageFile(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, or GIF images are allowed");
  }
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".svg") || lower.endsWith(".svgz")) {
    throw new Error("SVG uploads are not allowed");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be under 5MB");
  }
}

async function storeFile(file: File, folder: string) {
  const ext = EXT_BY_TYPE[file.type] ?? "bin";
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(key, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: file.type,
    });
    return blob.url;
  }

  const dir = path.join(process.cwd(), "public", folder);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = path.basename(key);
  await writeFile(path.join(dir, filename), buffer);
  return `/${folder}/${filename}`;
}

export async function uploadCoverImage(formData: FormData) {
  await requireAuth();
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("No file provided");
  assertImageFile(file);
  return storeFile(file, "uploads/blog");
}

export async function uploadAvatar(formData: FormData) {
  await requireAuth();
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("No file provided");
  assertImageFile(file);
  return storeFile(file, "uploads/avatars");
}

export async function uploadEditorImage(formData: FormData) {
  await requireAuth();
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("No file provided");
  assertImageFile(file);
  return storeFile(file, "uploads/blog");
}
