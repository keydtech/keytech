import { prisma } from "@/lib/db";
import { PostStatus } from "@prisma/client";

export const blogRevalidate = 60;

export async function getPublishedPosts(options?: {
  category?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = options?.pageSize ?? 9;
  const category = options?.category;
  const q = options?.q?.trim();

  const where = {
    status: PostStatus.PUBLISHED,
    ...(category
      ? {
          categories: {
            some: { category: { slug: category } },
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { titleEn: { contains: q, mode: "insensitive" as const } },
            { titleSo: { contains: q, mode: "insensitive" as const } },
            { excerptEn: { contains: q, mode: "insensitive" as const } },
            { excerptSo: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        author: { select: { name: true } },
        categories: { include: { category: true } },
      },
    }),
  ]);

  return {
    posts,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findFirst({
    where: { slug, status: PostStatus.PUBLISHED },
    include: {
      author: { select: { name: true } },
      categories: { include: { category: true } },
    },
  });
}

export async function getBlogCategories() {
  return prisma.category.findMany({
    orderBy: { nameEn: "asc" },
    include: {
      _count: {
        select: {
          posts: {
            where: { post: { status: PostStatus.PUBLISHED } },
          },
        },
      },
    },
  });
}

export async function getRelatedPosts(slug: string, categoryIds: string[]) {
  return prisma.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
      slug: { not: slug },
      ...(categoryIds.length
        ? {
            categories: {
              some: { categoryId: { in: categoryIds } },
            },
          }
        : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: {
      categories: { include: { category: true } },
    },
  });
}
