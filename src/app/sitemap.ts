import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/constants";
import { prisma } from "@/lib/db";
import type { MetadataRoute } from "next";

const PATHS = [
  "",
  "/solutions",
  "/keyd-app",
  "/clients",
  "/blog",
  "/pricing",
  "/about",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of PATHS) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" || path === "/blog" ? "weekly" : "monthly",
        priority: path === "" ? 1 : path === "/blog" ? 0.85 : 0.7,
      });
    }
  }

  try {
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, publishedAt: true },
    });

    for (const locale of routing.locales) {
      for (const post of posts) {
        entries.push({
          url: `${SITE_URL}/${locale}/blog/${post.slug}`,
          lastModified: post.updatedAt ?? post.publishedAt ?? new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  } catch {
    // DB unavailable during build — static routes still emitted
  }

  return entries;
}
