"use server";

import { auth } from "@/lib/auth";
import { canManageClients } from "@/lib/auth/rbac";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

type UploadResult = { ok: true; url: string } | { ok: false; error: string };

type FileLike = {
  name: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

function isFileLike(value: FormDataEntryValue | null): value is File {
  if (!value || typeof value === "string") return false;
  const candidate = value as FileLike;
  return (
    typeof candidate.arrayBuffer === "function" &&
    typeof candidate.size === "number" &&
    typeof candidate.name === "string"
  );
}

function normalizeMime(file: FileLike) {
  const type = (file.type || "").toLowerCase().trim();
  if (type) return type === "image/jpg" ? "image/jpeg" : type;

  const name = file.name.toLowerCase();
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".gif")) return "image/gif";
  return "";
}

function assertImageFile(file: FileLike) {
  const mime = normalizeMime(file);
  if (!mime || !ALLOWED_TYPES.has(mime)) {
    throw new Error("Only JPEG, PNG, WebP, or GIF images are allowed");
  }
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".svg") || lower.endsWith(".svgz")) {
    throw new Error("SVG uploads are not allowed");
  }
  if (file.size <= 0) {
    throw new Error("Empty file");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be under 5MB");
  }
  return mime === "image/jpg" ? "image/jpeg" : mime;
}

async function storeFile(file: FileLike, folder: string, mime: string) {
  const ext = EXT_BY_TYPE[mime] ?? "bin";
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(key, buffer, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: mime,
    });
    return blob.url;
  }

  const dir = path.join(process.cwd(), "public", folder);
  await mkdir(dir, { recursive: true });
  const filename = path.basename(key);
  await writeFile(path.join(dir, filename), buffer);
  return `/${folder}/${filename}`;
}

async function uploadImage(
  formData: FormData,
  folder: string,
): Promise<string> {
  const file = formData.get("file");
  if (!isFileLike(file)) throw new Error("No file provided");
  const mime = assertImageFile(file);
  return storeFile(file, folder, mime);
}

function toUploadError(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return "Upload failed";
}

export async function uploadCoverImage(formData: FormData) {
  await requireAuth();
  return uploadImage(formData, "uploads/blog");
}

export async function uploadAvatar(formData: FormData) {
  await requireAuth();
  return uploadImage(formData, "uploads/avatars");
}

export async function uploadEditorImage(formData: FormData) {
  await requireAuth();
  return uploadImage(formData, "uploads/blog");
}

/** Prefer this from ClientsManager — never throws digest/#441 to the client. */
export async function uploadClientLogo(
  formData: FormData,
): Promise<UploadResult> {
  try {
    const user = await requireAuth();
    if (!canManageClients(user.role)) {
      return { ok: false, error: "Only Super Admin can upload client logos" };
    }
    const url = await uploadImage(formData, "uploads/clients");
    return { ok: true, url };
  } catch (err) {
    return { ok: false, error: toUploadError(err) };
  }
}
