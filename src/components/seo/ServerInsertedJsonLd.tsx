"use client";

import { useServerInsertedHTML } from "next/navigation";
import { useRef } from "react";

type ServerInsertedJsonLdProps = {
  payloads: string[];
};

export function ServerInsertedJsonLd({ payloads }: ServerInsertedJsonLdProps) {
  const inserted = useRef(false);

  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;

    return (
      <>
        {payloads.map((html, index) => (
          <script
            key={`jsonld-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ))}
      </>
    );
  });

  return null;
}
