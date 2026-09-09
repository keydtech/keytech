"use server";

import {
  actionFail,
  actionOk,
  type ActionResult,
} from "@/lib/actions/action-utils";
import { auth } from "@/lib/auth";
import { canManageClients } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";
import { sanitizeMediaUrl } from "@/lib/sanitize";
import { slugify } from "@/lib/slug";
import { ClientIndustry, ClientWorkType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!canManageClients(session.user.role)) throw new Error("Forbidden");
  return session.user;
}

function revalidateClients() {
  revalidatePath("/admin/clients");
  revalidatePath("/en");
  revalidatePath("/so");
  revalidatePath("/en/clients");
  revalidatePath("/so/clients");
  revalidatePath("/en/about");
  revalidatePath("/so/about");
}

const clientSchema = z.object({
  name: z.string().min(2, "Company name is required").max(160),
  slug: z.string().max(120).optional().or(z.literal("")),
  logoUrl: z.string().max(500).optional().or(z.literal("")),
  industry: z.nativeEnum(ClientIndustry),
  workType: z.nativeEnum(ClientWorkType),
  descriptionEn: z.string().max(400).optional().or(z.literal("")),
  descriptionSo: z.string().max(400).optional().or(z.literal("")),
  websiteUrl: z
    .string()
    .max(300)
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^https:\/\//i.test(v),
      "Website must start with https://",
    ),
  featured: z.boolean().default(true),
  published: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

const statsSchema = z.object({
  yearsExperience: z.coerce.number().int().min(1).max(80),
  projectsCompleted: z.coerce.number().int().min(0).max(100000),
  expertsOnTeam: z.coerce.number().int().min(1).max(500),
});

export async function createClient(
  input: z.infer<typeof clientSchema>,
): Promise<ActionResult> {
  try {
    await requireSuperAdmin();
    const data = clientSchema.parse(input);
    const slug = slugify(data.slug || data.name);
    const logoUrl = sanitizeMediaUrl(data.logoUrl);

    await prisma.client.create({
      data: {
        name: data.name,
        slug,
        logoUrl,
        industry: data.industry,
        workType: data.workType,
        descriptionEn: data.descriptionEn || "",
        descriptionSo: data.descriptionSo || "",
        websiteUrl: data.websiteUrl || null,
        featured: data.featured,
        published: data.published,
        sortOrder: data.sortOrder,
      },
    });

    revalidateClients();
    return actionOk();
  } catch (err) {
    return actionFail(err);
  }
}

export async function updateClient(
  id: string,
  input: z.infer<typeof clientSchema>,
): Promise<ActionResult> {
  try {
    await requireSuperAdmin();
    const data = clientSchema.parse(input);
    const slug = slugify(data.slug || data.name);
    const logoUrl = sanitizeMediaUrl(data.logoUrl);

    await prisma.client.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        logoUrl,
        industry: data.industry,
        workType: data.workType,
        descriptionEn: data.descriptionEn || "",
        descriptionSo: data.descriptionSo || "",
        websiteUrl: data.websiteUrl || null,
        featured: data.featured,
        published: data.published,
        sortOrder: data.sortOrder,
      },
    });

    revalidateClients();
    return actionOk();
  } catch (err) {
    return actionFail(err);
  }
}

export async function deleteClient(id: string): Promise<ActionResult> {
  try {
    await requireSuperAdmin();
    await prisma.client.delete({ where: { id } });
    revalidateClients();
    return actionOk();
  } catch (err) {
    return actionFail(err);
  }
}

export async function updateSiteStats(
  input: z.infer<typeof statsSchema>,
): Promise<ActionResult> {
  try {
    await requireSuperAdmin();
    const data = statsSchema.parse(input);

    await prisma.siteSettings.upsert({
      where: { id: "default" },
      create: { id: "default", ...data },
      update: data,
    });

    revalidateClients();
    return actionOk();
  } catch (err) {
    return actionFail(err);
  }
}
