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

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

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

function mediaProxyPath(key: string) {
  return `/api/media/${key
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/")}`;
}

function toUploadError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (/private store|public access on a private/i.test(message)) {
    return "Blob store is private. Retry — the app will upload privately.";
  }
  if (/unauthorized|forbidden/i.test(message)) {
    return "You are not allowed to upload files.";
  }
  return message || "Upload failed";
}

async function storeFile(file: FileLike, folder: string, mime: string) {
  const ext = EXT_BY_TYPE[mime] ?? "bin";
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    // This project uses a private Blob store — always upload privately.
    const blob = await put(key, bytes, {
      access: "private",
      token,
      contentType: mime,
      addRandomSuffix: false,
    });
    const pathname = blob.pathname?.replace(/^\//, "") || key;
    return mediaProxyPath(pathname);
  }

  // Local / non-Blob fallback for development only (not durable on Vercel).
  const dir = path.join(process.cwd(), "public", folder);
  await mkdir(dir, { recursive: true });
  const filename = path.basename(key);
  await writeFile(path.join(dir, filename), bytes);
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

async function safeUpload(
  formData: FormData,
  folder: string,
): Promise<UploadResult> {
  try {
    await requireAuth();
    const url = await uploadImage(formData, folder);
    if (!url) return { ok: false, error: "Upload produced an empty URL" };
    return { ok: true, url };
  } catch (err) {
    return { ok: false, error: toUploadError(err) };
  }
}

export async function uploadCoverImage(
  formData: FormData,
): Promise<UploadResult> {
  return safeUpload(formData, "uploads/blog");
}

export async function uploadAvatar(formData: FormData): Promise<UploadResult> {
  return safeUpload(formData, "uploads/avatars");
}

export async function uploadEditorImage(
  formData: FormData,
): Promise<UploadResult> {
  return safeUpload(formData, "uploads/blog");
}

export async function uploadClientLogo(
  formData: FormData,
): Promise<UploadResult> {
  try {
    const user = await requireAuth();
    if (!canManageClients(user.role)) {
      return { ok: false, error: "Only Super Admin can upload client logos" };
    }
    const url = await uploadImage(formData, "uploads/clients");
    if (!url) return { ok: false, error: "Upload produced an empty URL" };
    return { ok: true, url };
  } catch (err) {
    return { ok: false, error: toUploadError(err) };
  }
}
