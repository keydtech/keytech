"use client";

import { RelativeTime } from "@/components/blog/RelativeTime";
import { cn } from "@/lib/utils";
import Image from "next/image";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Wide logos look bad in a circle — pad + contain instead of cover-crop. */
function isWideBrandAsset(url: string) {
  const lower = url.toLowerCase();
  return (
    lower.includes("logo") ||
    lower.includes("keydtech-logo") ||
    lower.includes("wordmark")
  );
}

export function AuthorByline({
  name,
  avatarUrl,
  date,
  locale = "en",
  size = "md",
}: {
  name: string;
  avatarUrl?: string | null;
  date: string | Date;
  locale?: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-10 w-10 text-xs" : "h-12 w-12 text-sm";
  const imgSizes = size === "sm" ? "40px" : "48px";
  const letter = initials(name) || "KT";
  const src = avatarUrl?.trim() || null;
  const treatAsLogo = src ? isWideBrandAsset(src) : false;

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full ring-2 ring-teal/35 ring-offset-2 ring-offset-background",
          dim,
          !src || treatAsLogo
            ? "bg-gradient-to-br from-navy to-[#123456]"
            : "bg-muted",
        )}
        aria-hidden
      >
        {src && !treatAsLogo ? (
          <Image
            src={src}
            alt=""
            fill
            className="object-cover object-center"
            sizes={imgSizes}
          />
        ) : src && treatAsLogo ? (
          <Image
            src="/images/avatar-keydtech.png"
            alt=""
            fill
            className="object-cover object-center"
            sizes={imgSizes}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display font-bold tracking-tight text-teal">
            {letter}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "truncate font-semibold text-foreground",
            size === "sm" ? "text-sm" : "text-[0.95rem]",
          )}
        >
          {name}
        </p>
        <RelativeTime
          date={date}
          locale={locale}
          className="text-xs text-muted-fg"
        />
      </div>
    </div>
  );
}
