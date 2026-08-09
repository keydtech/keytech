"use client";

import { Link } from "@/i18n/navigation";
import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";

type LogoProps = {
  className?: string;
  priority?: boolean;
  /** Keep a light plate behind the mark (footer / dark surfaces). */
  onDarkSurface?: boolean;
};

export function Logo({
  className,
  priority = false,
  onDarkSurface = false,
}: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex shrink-0 items-center transition-opacity hover:opacity-90",
        className,
      )}
      aria-label={SITE_NAME}
    >
      <span
        className={cn(
          "inline-flex items-center rounded-xl",
          onDarkSurface
            ? "bg-white px-2.5 py-1.5"
            : "dark:bg-white dark:px-2.5 dark:py-1.5",
        )}
      >
        <Image
          src="/images/keydtech-logo-transparent.png"
          alt={SITE_NAME}
          width={220}
          height={56}
          priority={priority}
          className="h-9 w-auto max-w-[9.5rem] object-contain object-left sm:h-10 sm:max-w-none md:h-12 lg:h-14"
        />
      </span>
    </Link>
  );
}
