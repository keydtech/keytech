"use server";

import {
  actionFail,
  actionOk,
  toActionError,
  type ActionResult,
} from "@/lib/actions/action-utils";
import { auth } from "@/lib/auth";
import {
  canEditPost,
  canManageCategories,
  canManageUsers,
  canPublish,
} from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";
import { sanitizeBlogHtml, sanitizeMediaUrl } from "@/lib/sanitize";
import { slugify } from "@/lib/slug";
import { PostStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

const categorySchema = z.object({
  slug: z.string().max(80).optional().or(z.literal("")),
  nameEn: z.string().min(2, "English name is required").max(120),
  nameSo: z.string().min(2, "Somali name is required").max(120),
  descriptionEn: z.string().max(500).optional().or(z.literal("")),
  descriptionSo: z.string().max(500).optional().or(z.literal("")),
});

export async function createCategory(
  input: z.infer<typeof categorySchema>,
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    if (!canManageCategories(user.role)) throw new Error("Forbidden");

    const data = categorySchema.parse(input);
    const slug = slugify(data.slug || data.nameEn);

    await prisma.category.create({
      data: {
        slug,
        nameEn: data.nameEn,
        nameSo: data.nameSo,
        descriptionEn: data.descriptionEn || null,
        descriptionSo: data.descriptionSo || null,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/en/blog");
    revalidatePath("/so/blog");
    return actionOk();
  } catch (err) {
    return actionFail(err);
  }
}

export async function updateCategory(
  id: string,
  input: z.infer<typeof categorySchema>,
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    if (!canManageCategories(user.role)) throw new Error("Forbidden");

    const data = categorySchema.parse(input);
    const slug = slugify(data.slug || data.nameEn);

    await prisma.category.update({
      where: { id },
      data: {
        slug,
        nameEn: data.nameEn,
        nameSo: data.nameSo,
        descriptionEn: data.descriptionEn || null,
        descriptionSo: data.descriptionSo || null,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/en/blog");
    revalidatePath("/so/blog");
    return actionOk();
  } catch (err) {
    return actionFail(err);
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    if (!canManageCategories(user.role)) throw new Error("Forbidden");
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    revalidatePath("/en/blog");
    revalidatePath("/so/blog");
    return actionOk();
  } catch (err) {
    return actionFail(err);
  }
}

const postSchema = z.object({
  slug: z.string().min(2).max(120).optional(),
  titleEn: z.string().min(3, "English title is required (min 3 chars)").max(200),
  titleSo: z.string().min(3, "Somali title is required (min 3 chars)").max(200),
  excerptEn: z.string().max(500).optional(),
  excerptSo: z.string().max(500).optional(),
  contentEn: z.string().optional(),
  contentSo: z.string().optional(),
  coverImageUrl: z.string().max(500).optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "ARCHIVED"]),
  categoryIds: z.array(z.string()).default([]),
  seoTitleEn: z.string().max(200).optional(),
  seoTitleSo: z.string().max(200).optional(),
  seoDescEn: z.string().max(300).optional(),
  seoDescSo: z.string().max(300).optional(),
});

/** Authors may only draft or submit for review; editors/admins set any status. */
function resolvePostStatus(role: Role, requested: PostStatus): PostStatus {
  if (canPublish(role)) return requested;
  if (requested === PostStatus.PENDING_REVIEW) return PostStatus.PENDING_REVIEW;
  return PostStatus.DRAFT;
}

function revalidateBlogPaths(slug?: string, postId?: string) {
  revalidatePath("/admin/posts");
  revalidatePath("/en/blog");
  revalidatePath("/so/blog");
  if (postId) revalidatePath(`/admin/posts/${postId}/edit`);
  if (slug) {
    revalidatePath(`/en/blog/${slug}`);
    revalidatePath(`/so/blog/${slug}`);
  }
}

export async function createPost(
  input: z.infer<typeof postSchema>,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const user = await requireUser();
    const data = postSchema.parse(input);
    const status = resolvePostStatus(user.role, data.status as PostStatus);
    const slug = slugify(data.slug || data.titleEn);
    if (!slug || slug.length < 2) {
      throw new Error("Add a valid English title (used for the URL slug)");
    }
    const coverImageUrl = sanitizeMediaUrl(data.coverImageUrl);

    const post = await prisma.post.create({
      data: {
        slug,
        titleEn: data.titleEn,
        titleSo: data.titleSo,
        excerptEn: data.excerptEn ?? "",
        excerptSo: data.excerptSo ?? "",
        contentEn: sanitizeBlogHtml(data.contentEn ?? ""),
        contentSo: sanitizeBlogHtml(data.contentSo ?? ""),
        coverImageUrl,
        status,
        publishedAt: status === PostStatus.PUBLISHED ? new Date() : null,
        authorId: user.id,
        seoTitleEn: data.seoTitleEn || null,
        seoTitleSo: data.seoTitleSo || null,
        seoDescEn: data.seoDescEn || null,
        seoDescSo: data.seoDescSo || null,
        categories: {
          create: data.categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
    });

    revalidateBlogPaths(slug);
    return { ok: true, id: post.id };
  } catch (err) {
    return { ok: false, error: toActionError(err).message };
  }
}

export async function updatePost(
  id: string,
  input: z.infer<typeof postSchema>,
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) throw new Error("Not found");
    if (!canEditPost(user.role, existing.authorId, user.id)) {
      throw new Error("Forbidden");
    }

    const data = postSchema.parse(input);
    let status = resolvePostStatus(user.role, data.status as PostStatus);

    // Authors cannot keep a live post published — edits require re-approval.
    if (!canPublish(user.role) && existing.status === PostStatus.PUBLISHED) {
      status =
        data.status === PostStatus.PENDING_REVIEW
          ? PostStatus.PENDING_REVIEW
          : PostStatus.DRAFT;
    }

    const slug = slugify(data.slug || data.titleEn);
    const coverImageUrl = sanitizeMediaUrl(data.coverImageUrl);

    await prisma.post.update({
      where: { id },
      data: {
        slug,
        titleEn: data.titleEn,
        titleSo: data.titleSo,
        excerptEn: data.excerptEn ?? "",
        excerptSo: data.excerptSo ?? "",
        contentEn: sanitizeBlogHtml(data.contentEn ?? ""),
        contentSo: sanitizeBlogHtml(data.contentSo ?? ""),
        coverImageUrl,
        status,
        publishedAt:
          status === PostStatus.PUBLISHED
            ? (existing.publishedAt ?? new Date())
            : status === PostStatus.ARCHIVED
              ? existing.publishedAt
              : null,
        seoTitleEn: data.seoTitleEn || null,
        seoTitleSo: data.seoTitleSo || null,
        seoDescEn: data.seoDescEn || null,
        seoDescSo: data.seoDescSo || null,
        categories: {
          deleteMany: {},
          create: data.categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
    });

    revalidateBlogPaths(slug, id);
    return actionOk();
  } catch (err) {
    return actionFail(err);
  }
}

export async function approvePost(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    if (!canPublish(user.role)) throw new Error("Forbidden");

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) throw new Error("Not found");

    await prisma.post.update({
      where: { id },
      data: {
        status: PostStatus.PUBLISHED,
        publishedAt: existing.publishedAt ?? new Date(),
      },
    });

    revalidateBlogPaths(existing.slug, id);
    return actionOk();
  } catch (err) {
    return actionFail(err);
  }
}

export async function rejectPost(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    if (!canPublish(user.role)) throw new Error("Forbidden");

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) throw new Error("Not found");

    await prisma.post.update({
      where: { id },
      data: {
        status: PostStatus.DRAFT,
        publishedAt: null,
      },
    });

    revalidateBlogPaths(existing.slug, id);
    return actionOk();
  } catch (err) {
    return actionFail(err);
  }
}

export async function deletePost(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) throw new Error("Not found");
    if (!canEditPost(user.role, existing.authorId, user.id)) {
      throw new Error("Forbidden");
    }
    await prisma.post.delete({ where: { id } });
    revalidateBlogPaths(existing.slug);
    return actionOk();
  } catch (err) {
    return actionFail(err);
  }
}

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(64),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  role: z.enum(["SUPER_ADMIN", "EDITOR", "AUTHOR"]),
  avatarUrl: z.string().max(500).optional().or(z.literal("")),
});

const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(64),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .optional()
    .or(z.literal("")),
  role: z.enum(["SUPER_ADMIN", "EDITOR", "AUTHOR"]),
  avatarUrl: z.string().max(500).optional().or(z.literal("")),
});

export async function createUser(
  input: z.infer<typeof userSchema>,
): Promise<ActionResult> {
  try {
    const actor = await requireUser();
    if (!canManageUsers(actor.role)) throw new Error("Forbidden");

    const data = userSchema.parse(input);
    const passwordHash = await bcrypt.hash(data.password, 12);

    await prisma.user.create({
      data: {
        name: data.name,
        username: data.username.toLowerCase(),
        email: data.email || null,
        passwordHash,
        role: data.role as Role,
        avatarUrl: data.avatarUrl || null,
      },
    });

    revalidatePath("/admin/users");
    return actionOk();
  } catch (err) {
    return actionFail(err);
  }
}

export async function updateUser(
  id: string,
  input: z.infer<typeof updateUserSchema>,
): Promise<ActionResult> {
  try {
    const actor = await requireUser();
    if (!canManageUsers(actor.role)) throw new Error("Forbidden");

    const data = updateUserSchema.parse(input);
    const updates: {
      name: string;
      username: string;
      email: string | null;
      role: Role;
      avatarUrl: string | null;
      passwordHash?: string;
    } = {
      name: data.name,
      username: data.username.toLowerCase(),
      email: data.email || null,
      role: data.role as Role,
      avatarUrl: data.avatarUrl || null,
    };

    if (data.password) {
      updates.passwordHash = await bcrypt.hash(data.password, 12);
    }

    await prisma.user.update({ where: { id }, data: updates });
    revalidatePath("/admin/users");
    revalidatePath("/en/blog");
    revalidatePath("/so/blog");
    return actionOk();
  } catch (err) {
    return actionFail(err);
  }
}

export async function updateUserRole(
  id: string,
  role: Role,
): Promise<ActionResult> {
  try {
    const actor = await requireUser();
    if (!canManageUsers(actor.role)) throw new Error("Forbidden");
    await prisma.user.update({ where: { id }, data: { role } });
    revalidatePath("/admin/users");
    return actionOk();
  } catch (err) {
    return actionFail(err);
  }
}

export async function setUserActive(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  try {
    const actor = await requireUser();
    if (!canManageUsers(actor.role)) throw new Error("Forbidden");
    if (actor.id === id && !active) {
      throw new Error("You cannot deactivate yourself");
    }
    await prisma.user.update({ where: { id }, data: { active } });
    revalidatePath("/admin/users");
    return actionOk();
  } catch (err) {
    return actionFail(err);
  }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  try {
    const actor = await requireUser();
    if (!canManageUsers(actor.role)) throw new Error("Forbidden");
    if (actor.id === id) throw new Error("You cannot delete yourself");
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/users");
    return actionOk();
  } catch (err) {
    return actionFail(err);
  }
}

const profileSchema = z.object({
  name: z.string().min(2).max(120),
  username: z.string().min(3).max(64),
  currentPassword: z.string().min(6).optional(),
  newPassword: z.string().min(8).max(128).optional().or(z.literal("")),
  avatarUrl: z.string().max(500).optional().or(z.literal("")),
});

export async function updateProfile(
  input: z.infer<typeof profileSchema>,
): Promise<ActionResult> {
  try {
    const actor = await requireUser();
    const data = profileSchema.parse(input);

    const user = await prisma.user.findUnique({ where: { id: actor.id } });
    if (!user) throw new Error("Not found");

    const updates: {
      name: string;
      username: string;
      avatarUrl: string | null;
      passwordHash?: string;
    } = {
      name: data.name,
      username: data.username.toLowerCase(),
      avatarUrl: data.avatarUrl || null,
    };

    if (data.newPassword) {
      if (!data.currentPassword) {
        throw new Error("Current password required");
      }
      const ok = await bcrypt.compare(data.currentPassword, user.passwordHash);
      if (!ok) throw new Error("Current password is incorrect");
      updates.passwordHash = await bcrypt.hash(data.newPassword, 12);
    }

    await prisma.user.update({
      where: { id: actor.id },
      data: updates,
    });

    revalidatePath("/admin/profile");
    revalidatePath("/en/blog");
    revalidatePath("/so/blog");
    return actionOk();
  } catch (err) {
    return actionFail(err);
  }
}
