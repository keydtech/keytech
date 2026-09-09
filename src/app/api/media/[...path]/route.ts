import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function isSafeUploadPath(pathname: string) {
  if (!pathname.startsWith("uploads/")) return false;
  if (pathname.includes("..")) return false;
  return /^uploads\/[a-zA-Z0-9._/-]+$/.test(pathname);
}

export async function GET(_request: Request, context: RouteContext) {
  const segments = (await context.params).path ?? [];
  const pathname = segments.map(decodeURIComponent).join("/");

  if (!isSafeUploadPath(pathname)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return new NextResponse("Media unavailable", { status: 503 });
  }

  try {
    const result = await get(pathname, {
      access: "private",
      token,
    });

    if (!result?.stream) {
      return new NextResponse("Not found", { status: 404 });
    }

    const contentType =
      result.blob.contentType ?? "application/octet-stream";

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
