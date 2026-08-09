"use client";

import { Button } from "@/components/ui/Button";
import { CONTACT, getWhatsAppUrl } from "@/lib/constants";
import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

const INDUSTRIES = [
  "retail",
  "electronics",
  "pharmacy",
  "wholesale",
  "services",
  "manufacturing",
  "other",
] as const;

export function ContactForm() {
  const t = useTranslations("Contact");
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [industry, setIndustry] = useState<(typeof INDUSTRIES)[number]>("retail");
  const [message, setMessage] = useState("");

  const href = useMemo(() => {
    const industryLabel = t(`form.industries.${industry}`);
    const composed = [
      "Hello KeydTech, I want to inquire about Odoo ERP for my business.",
      name && `Name: ${name}`,
      business && `Business: ${business}`,
      `Industry: ${industryLabel}`,
      message && `Message: ${message}`,
    ]
      .filter(Boolean)
      .join("\n");

    return getWhatsAppUrl(composed);
  }, [name, business, industry, message, t]);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-muted-fg">{t("subtitle")}</p>

        <dl className="mt-8 space-y-4 text-sm">
          <div>
            <dt className="font-semibold text-foreground">{t("addressLabel")}</dt>
            <dd className="text-muted-fg">{CONTACT.address}</dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">{t("emailLabel")}</dt>
            <dd>
              <a
                href={`mailto:${CONTACT.email}`}
                className="text-teal hover:underline"
              >
                {CONTACT.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">{t("phoneLabel")}</dt>
            <dd className="text-muted-fg">{CONTACT.phoneDisplay}</dd>
          </div>
        </dl>

        <Button
          href={getWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          variant="whatsapp"
          className="mt-8"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          {t("whatsapp")}
        </Button>
      </div>

      <form
        className="rounded-2xl border border-border bg-surface/70 p-6 sm:p-8"
        onSubmit={(event) => {
          event.preventDefault();
          window.open(href, "_blank", "noopener,noreferrer");
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">
              {t("form.name")}
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none ring-teal focus:ring-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">
              {t("form.business")}
            </span>
            <input
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none ring-teal focus:ring-2"
            />
          </label>
        </div>

        <label className="mt-4 block text-sm">
          <span className="mb-1.5 block font-medium text-foreground">
            {t("form.industry")}
          </span>
          <select
            value={industry}
            onChange={(e) =>
              setIndustry(e.target.value as (typeof INDUSTRIES)[number])
            }
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none ring-teal focus:ring-2"
          >
            {INDUSTRIES.map((item) => (
              <option key={item} value={item}>
                {t(`form.industries.${item}`)}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block text-sm">
          <span className="mb-1.5 block font-medium text-foreground">
            {t("form.message")}
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full resize-y rounded-xl border border-border bg-background px-3 py-2.5 outline-none ring-teal focus:ring-2"
          />
        </label>

        <button
          type="submit"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe57]"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          {t("form.submit")}
        </button>
      </form>
    </div>
  );
}
