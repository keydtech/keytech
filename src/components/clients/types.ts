import type { ClientIndustry, ClientWorkType } from "@prisma/client";

export type PublicClient = {
  id: string;
  name: string;
  logoUrl: string | null;
  industry: ClientIndustry;
  workType: ClientWorkType;
  descriptionEn: string;
  descriptionSo: string;
  websiteUrl: string | null;
  featured: boolean;
};

export const HOME_CLIENTS_PREVIEW = 6;

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
