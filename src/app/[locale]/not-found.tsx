import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("Common");

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-6xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="font-display text-6xl font-bold text-teal">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-foreground">
        Page not found
      </h1>
      <Link
        href="/"
        className="mt-6 text-sm font-semibold text-navy underline-offset-4 hover:text-teal hover:underline dark:text-teal"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
