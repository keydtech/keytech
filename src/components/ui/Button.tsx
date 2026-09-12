import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "whatsapp";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-navy text-white hover:bg-navy/90 dark:bg-teal dark:text-midnight dark:hover:bg-teal-dim",
  secondary:
    "border border-border bg-surface/60 text-foreground hover:border-teal/50 hover:text-navy dark:hover:text-offwhite",
  ghost: "text-muted-fg hover:text-foreground hover:bg-muted",
  whatsapp:
    "bg-[#25D366] text-white hover:bg-[#1ebe57] shadow-[0_8px_24px_rgba(37,211,102,0.35)]",
};

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-background";

type ButtonProps = {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
  target?: string;
  rel?: string;
  /** Forces a plain anchor (e.g. APK file download). */
  download?: boolean | string;
};

function isExternalHref(href: string) {
  return (
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("https://wa.me")
  );
}

export function Button({
  className,
  variant = "primary",
  children,
  href,
  target,
  rel,
  download,
}: ButtonProps) {
  const classes = cn(baseClass, variants[variant], className);

  if (isExternalHref(href) || download !== undefined) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        download={download === false ? undefined : download === true ? true : download}
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

type NativeButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
};

export function IconButton({
  className,
  variant = "ghost",
  children,
  ...props
}: NativeButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
