import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Explicit static imports so Turbopack always picks up message edits.
  const messages =
    locale === "so"
      ? (await import("../messages/so.json")).default
      : (await import("../messages/en.json")).default;

  return {
    locale,
    messages,
  };
});
