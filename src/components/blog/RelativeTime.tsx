"use client";

import { formatRelativeTime } from "@/lib/relative-time";
import { useEffect, useState } from "react";

export function RelativeTime({
  date,
  locale = "en",
  className,
}: {
  date: string | Date;
  locale?: string;
  className?: string;
}) {
  const iso = typeof date === "string" ? date : date.toISOString();
  const [label, setLabel] = useState(() => formatRelativeTime(iso, locale));

  useEffect(() => {
    const tick = () => setLabel(formatRelativeTime(iso, locale));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [iso, locale]);

  return (
    <time dateTime={iso} className={className} title={new Date(iso).toLocaleString()}>
      {label}
    </time>
  );
}
