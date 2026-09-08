"use server";

import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

function assertImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be under 5MB");
  }
}

async function storeFile(file: File, folder: string) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${folder}/${Date.now()}-${safeName}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(key, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }

  // Local / non-Blob fallback for development
  const dir = path.join(process.cwd(), "public", folder);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${safeName}`;
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
