"use client";

import { Link } from "@/i18n/navigation";
import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";

type LogoProps = {
  className?: string;
  priority?: boolean;
  /** Use light wordmark for navy/dark footer surfaces. */
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
        "group relative inline-flex shrink-0 items-center transition-opacity hover:opacity-90",
        className,
      )}
      aria-label={SITE_NAME}
    >
      {/* Light backgrounds: navy wordmark */}
      <Image
        src="/images/keydtech-logo-transparent.png"
        alt={SITE_NAME}
        width={220}
        height={56}
        priority={priority}
        className={cn(
          "h-9 w-auto max-w-[9.5rem] object-contain object-left sm:h-10 sm:max-w-none md:h-12 lg:h-14",
          onDarkSurface ? "hidden" : "block dark:hidden",
        )}
      />
      {/* Dark backgrounds / dark mode: light wordmark */}
      <Image
        src="/images/keydtech-logo-on-dark.png"
        alt={SITE_NAME}
        width={220}
        height={56}
        priority={priority}
        className={cn(
          "h-9 w-auto max-w-[9.5rem] object-contain object-left sm:h-10 sm:max-w-none md:h-12 lg:h-14",
          onDarkSurface ? "block" : "hidden dark:block",
        )}
      />
    </Link>
  );
}
