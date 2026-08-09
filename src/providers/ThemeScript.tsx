"use client";

import { themeInitScript } from "@/lib/theme-script";
import { useServerInsertedHTML } from "next/navigation";
import { useRef } from "react";

/** Injects the FOUC-prevention theme script outside the React client tree. */
export function ThemeScript() {
  const inserted = useRef(false);

  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;

    return (
      <script
        id="keydtech-theme-init"
        dangerouslySetInnerHTML={{ __html: themeInitScript }}
      />
    );
  });

  return null;
}
