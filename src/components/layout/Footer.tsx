import { Logo } from "@/components/layout/Logo";
import { Link } from "@/i18n/navigation";
import {
  CONTACT,
  getWhatsAppUrl,
  NAV_ITEMS,
  SOLUTION_IDS,
} from "@/lib/constants";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("Footer");
  const tNav = await getTranslations("Nav");
  const tSolutions = await getTranslations("Solutions");

  return (
    <footer className="border-t border-border bg-navy text-offwhite dark:bg-[#060910]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Logo onDarkSurface />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
            {t("tagline")}
          </p>
          <p className="mt-4 text-xs text-teal/90">{t("seoLine")}</p>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold tracking-wide text-white">
            {t("navTitle")}
          </h3>
          <ul className="mt-4 space-y-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="text-sm text-slate-300 transition-colors hover:text-teal"
                >
                  {tNav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold tracking-wide text-white">
            {t("solutionsTitle")}
          </h3>
          <ul className="mt-4 space-y-2">
            {SOLUTION_IDS.slice(0, 4).map((id) => (
              <li key={id}>
                <Link
                  href="/solutions"
                  className="text-sm text-slate-300 transition-colors hover:text-teal"
                >
                  {tSolutions(`items.${id}.title`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold tracking-wide text-white">
            {t("contactTitle")}
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>{CONTACT.address}</li>
            <li>
              <a
                href={`mailto:${CONTACT.email}`}
                className="transition-colors hover:text-teal"
              >
                {CONTACT.email}
              </a>
            </li>
            <li>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-teal"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} KeydTech. {t("rights")}
          </p>
          <p>Mogadishu · Odoo ERP Somalia</p>
        </div>
      </div>
    </footer>
  );
}
