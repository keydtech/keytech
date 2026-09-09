import { get } from "@vercel/blob";
import { Readable } from "node:stream";
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

async function readStream(stream: unknown): Promise<Uint8Array> {
  if (!stream) throw new Error("Empty stream");

  // Web ReadableStream
  if (
    typeof stream === "object" &&
    stream !== null &&
    "getReader" in stream &&
    typeof (stream as ReadableStream).getReader === "function"
  ) {
    const reader = (stream as ReadableStream<Uint8Array>).getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        total += value.length;
      }
    }
    const out = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      out.set(chunk, offset);
      offset += chunk.length;
    }
    return out;
  }

  // Node.js Readable
  const nodeStream = stream as Readable;
  const chunks: Buffer[] = [];
  for await (const chunk of nodeStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return new Uint8Array(Buffer.concat(chunks));
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

    const bytes = await readStream(result.stream);
    const contentType =
      result.blob.contentType ?? "application/octet-stream";

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
