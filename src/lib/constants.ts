export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://keydtech.com";

export const SITE_NAME = "KeydTech";

export const CONTACT = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "info@keydtech.com",
  phoneDisplay: process.env.NEXT_PUBLIC_PHONE_DISPLAY ?? "+252 61 XXX XXXX",
  whatsappNumber:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "252615000000",
  address:
    process.env.NEXT_PUBLIC_ADDRESS ?? "Mogadishu, Somalia",
} as const;

export const WHATSAPP_PREFILL =
  "Hello KeydTech, I want to inquire about Odoo ERP for my business.";

export function getWhatsAppUrl(message: string = WHATSAPP_PREFILL) {
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const NAV_ITEMS = [
  { href: "/", key: "home" as const },
  { href: "/solutions", key: "solutions" as const },
  { href: "/pricing", key: "pricing" as const },
  { href: "/about", key: "about" as const },
  { href: "/contact", key: "contact" as const },
] as const;

export const SOLUTION_IDS = [
  "retail",
  "electronics",
  "pharmacy",
  "wholesale",
  "services",
  "manufacturing",
] as const;

export type SolutionId = (typeof SOLUTION_IDS)[number];
