import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
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
];

const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "class",
  "width",
  "height",
  "allow",
  "allowfullscreen",
  "frameborder",
  "referrerpolicy",
  "data-youtube-video",
];

/** Strip executable HTML before storing or rendering blog content. */
export function sanitizeBlogHtml(html: string): string {
  if (!html?.trim()) return "";

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ["allowfullscreen", "referrerpolicy"],
    FORBID_TAGS: ["script", "style", "object", "embed", "form", "input"],
    FORBID_ATTR: ["style", "onerror", "onload", "onclick"],
  });
}

const SAFE_URL =
  /^(https:\/\/[^\s]+|\/uploads\/[a-zA-Z0-9._/-]+|\/images\/[a-zA-Z0-9._/-]+)$/;

export function sanitizeMediaUrl(url: string | null | undefined): string | null {
  const value = (url ?? "").trim();
  if (!value) return null;
  if (!SAFE_URL.test(value)) {
    throw new Error("Invalid image URL");
  }
  if (value.startsWith("https://")) {
    try {
      const parsed = new URL(value);
      if (parsed.protocol !== "https:") throw new Error("Invalid image URL");
    } catch {
      throw new Error("Invalid image URL");
    }
  }
  return value;
}
