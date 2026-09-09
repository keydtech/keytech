"use client";

import { Button } from "@/components/ui/Button";
import {
  CONTACT,
  getMailtoUrl,
  getWhatsAppUrl,
  WHATSAPP_PREFILL,
} from "@/lib/constants";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

const INDUSTRIES = [
  "retail",
  "electronics",
  "pharmacy",
  "wholesale",
  "services",
  "manufacturing",
  "other",
] as const;

function buildInquiryMessage(
  industryLabel: string,
  values: {
    name: string;
    business: string;
    message: string;
  },
) {
  return [
    WHATSAPP_PREFILL,
    values.name && `Name: ${values.name}`,
    values.business && `Business: ${values.business}`,
    `Industry: ${industryLabel}`,
    values.message && `Message: ${values.message}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function ContactForm() {
  const t = useTranslations("Contact");
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [industry, setIndustry] = useState<(typeof INDUSTRIES)[number]>("retail");
  const [message, setMessage] = useState("");

  const composed = useMemo(
    () =>
      buildInquiryMessage(t(`form.industries.${industry}`), {
        name,
        business,
        message,
      }),
    [name, business, industry, message, t],
  );

  const phoneHref = `tel:${CONTACT.phoneDisplay.replace(/\s+/g, "")}`;

  function openWhatsApp() {
    window.open(getWhatsAppUrl(composed), "_blank", "noopener,noreferrer");
    toast.success(t("form.openedWhatsApp"));
  }

  function openEmail() {
    window.location.href = getMailtoUrl(t("form.emailSubject"), composed);
    toast.success(t("form.openedEmail"));
  }

  function onWhatsAppSubmit(event: FormEvent) {
    event.preventDefault();
    openWhatsApp();
  }

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
            <dd>
              <a
                href={phoneHref}
                className="inline-flex items-center gap-2 text-teal hover:underline"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden />
                {CONTACT.phoneDisplay}
              </a>
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            variant="whatsapp"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            {t("whatsapp")}
          </Button>
          <Button href={`mailto:${CONTACT.email}`} variant="secondary">
            <Mail className="h-4 w-4" aria-hidden />
            {t("emailCta")}
          </Button>
        </div>
      </div>

      <form
        className="rounded-2xl border border-border bg-surface/70 p-6 sm:p-8"
        onSubmit={onWhatsAppSubmit}
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

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe57]"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            {t("form.submit")}
          </button>
          <button
            type="button"
            onClick={openEmail}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:border-teal/50 hover:text-teal"
          >
            <Mail className="h-4 w-4" aria-hidden />
            {t("form.submitEmail")}
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-fg">{t("form.hint")}</p>
      </form>
    </div>
  );
}
