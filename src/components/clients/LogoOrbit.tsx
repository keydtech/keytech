"use client";

import {
  initials,
  type PublicClient,
} from "@/components/clients/types";
import Image from "next/image";
import { useTranslations } from "next-intl";

function Pill({ client, index }: { client: PublicClient; index: number }) {
  return (
    <div
      className="clients-pill flex h-[4.5rem] w-[10.5rem] shrink-0 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 backdrop-blur-md sm:h-20 sm:w-52 sm:gap-3 sm:px-4"
      style={{ animationDelay: `${(index % 6) * 0.35}s` }}
    >
      {client.logoUrl ? (
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white/95 sm:h-12 sm:w-12">
          <Image
            src={client.logoUrl}
            alt={client.name}
            fill
            className="object-contain p-1"
            sizes="48px"
          />
        </div>
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal/20 font-display text-xs font-bold text-teal sm:h-12 sm:w-12 sm:text-sm">
          {initials(client.name) || "KT"}
        </div>
      )}
      <span className="min-w-0 truncate font-display text-xs font-semibold text-white/90 sm:text-sm">
        {client.name}
      </span>
    </div>
  );
}

function Track({
  clients,
  direction,
}: {
  clients: PublicClient[];
  direction: "left" | "right";
}) {
  const loop = [...clients, ...clients, ...clients];
  return (
    <div
      className={`clients-track ${
        direction === "left" ? "clients-track-left" : "clients-track-right"
      }`}
    >
      {loop.map((client, index) => (
        <Pill key={`${direction}-${client.id}-${index}`} client={client} index={index} />
      ))}
    </div>
  );
}

export function LogoOrbit({ clients }: { clients: PublicClient[] }) {
  const t = useTranslations("Clients");
  if (clients.length === 0) return null;

  const rowA = clients;
  const rowB = [...clients].reverse();

  return (
    <div className="clients-orbit px-3 py-6 sm:px-5 sm:py-8">
      <p className="relative mb-5 text-center text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-teal/90 sm:mb-6 sm:text-xs">
        {t("orbitLabel")}
      </p>
      <div className="relative space-y-4 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#0a2540] to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#0a2540] to-transparent sm:w-24" />
        <Track clients={rowA} direction="left" />
        <Track clients={rowB} direction="right" />
      </div>
    </div>
  );
}
