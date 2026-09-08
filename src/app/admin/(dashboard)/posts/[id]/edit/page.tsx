import { PostForm } from "@/components/admin/PostForm";
import { canEditPost, canPublish } from "@/lib/auth/rbac";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const [post, categories] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: { categories: true },
    }),
    prisma.category.findMany({ orderBy: { nameEn: "asc" } }),
  ]);

  if (!post) notFound();
  if (!canEditPost(session.user.role, post.authorId, session.user.id)) {
    redirect("/admin/posts");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold">Edit post</h1>
        {post.status === "PUBLISHED" ? (
          <a
            href={`/en/blog/${post.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-teal hover:underline"
          >
            Preview EN
          </a>
        ) : null}
      </div>
      <PostForm
        mode="edit"
        postId={post.id}
        categories={categories.map((c) => ({ id: c.id, nameEn: c.nameEn }))}
        canPublish={canPublish(session.user.role)}
        initial={{
          slug: post.slug,
          titleEn: post.titleEn,
          titleSo: post.titleSo,
          excerptEn: post.excerptEn,
          excerptSo: post.excerptSo,
          contentEn: post.contentEn,
          contentSo: post.contentSo,
          coverImageUrl: post.coverImageUrl ?? "",
          status: post.status,
          categoryIds: post.categories.map((c) => c.categoryId),
          seoTitleEn: post.seoTitleEn ?? "",
          seoTitleSo: post.seoTitleSo ?? "",
          seoDescEn: post.seoDescEn ?? "",
          seoDescSo: post.seoDescSo ?? "",
        }}
      />
    </div>
  );
}
