export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://keydtech.com";

export const SITE_NAME = "KeydTech";

function resolvePublicContact() {
  const envWhatsApp = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").trim();
  const envPhone = (process.env.NEXT_PUBLIC_PHONE_DISPLAY ?? "").trim();
  const envEmail = (process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "").trim();

  // Ignore placeholders like 25261xxxxxxx so live contact always works.
  const whatsappNumber =
    envWhatsApp && !/[xX]{3,}/.test(envWhatsApp)
      ? envWhatsApp.replace(/\D/g, "")
      : "252772127799";

  const phoneDisplay =
    envPhone && !/[xX]{3,}/.test(envPhone) ? envPhone : "+252 772127799";

  const email =
    envEmail.includes("@") ? envEmail : "keydtechnology@gmail.com";

  return {
    email,
    whatsappNumber,
    phoneDisplay,
    address:
      process.env.NEXT_PUBLIC_ADDRESS?.trim() || "Mogadishu, Somalia",
  } as const;
}

export const CONTACT = resolvePublicContact();

export const WHATSAPP_PREFILL =
  "Hello KeydTech, I want to inquire about your technology services (apps, websites, systems, or Odoo ERP).";

export function getWhatsAppUrl(message: string = WHATSAPP_PREFILL) {
  const digits = CONTACT.whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function getMailtoUrl(subject: string, body: string) {
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export const NAV_ITEMS = [
  { href: "/", key: "home" as const },
  { href: "/solutions", key: "solutions" as const },
  { href: "/clients", key: "clients" as const },
  { href: "/blog", key: "blog" as const },
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
