import sanitizeHtml from "sanitize-html";

/**
 * Server-safe HTML sanitizer (no jsdom).
 * isomorphic-dompurify breaks on Vercel serverless and causes 500s.
 */
export function sanitizeBlogHtml(html: string): string {
  if (!html?.trim()) return "";

  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "b",
      "i",
      "u",
      "s",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
      "img",
      "iframe",
      "div",
      "span",
      "hr",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "class"],
      iframe: [
        "src",
        "width",
        "height",
        "allow",
        "allowfullscreen",
        "frameborder",
        "referrerpolicy",
        "class",
        "title",
      ],
      div: ["class", "data-youtube-video"],
      span: ["class"],
      p: ["class"],
      h2: ["class"],
      h3: ["class"],
      blockquote: ["class"],
      ul: ["class"],
      ol: ["class"],
      li: ["class"],
    },
    allowedSchemes: ["https", "http", "mailto"],
    allowedSchemesByTag: {
      img: ["https", "http"],
      iframe: ["https"],
      a: ["https", "http", "mailto"],
    },
    allowedIframeHostnames: [
      "www.youtube.com",
      "youtube.com",
      "www.youtube-nocookie.com",
      "youtube-nocookie.com",
    ],
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  });
}

const SAFE_URL =
  /^(https:\/\/[^\s]+|\/uploads\/[a-zA-Z0-9._/-]+|\/images\/[a-zA-Z0-9._/-]+|\/api\/media\/uploads\/[a-zA-Z0-9._/%-]+)$/;

export function sanitizeMediaUrl(url: string | null | undefined): string | null {
  const value = (url ?? "").trim();
  if (!value) return null;
  if (!SAFE_URL.test(value)) {
    throw new Error(
      "Invalid image URL. Upload an image or use https:// /uploads/ /images/ /api/media/",
    );
  }
  if (value.startsWith("https://")) {
    try {
      const parsed = new URL(value);
      if (parsed.protocol !== "https:") throw new Error("Invalid image URL");
    } catch {
      throw new Error("Invalid image URL");
    }
  }
  if (value.includes("..")) {
    throw new Error("Invalid image URL");
  }
  return value;
}
