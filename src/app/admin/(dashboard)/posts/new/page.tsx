import { PostForm } from "@/components/admin/PostForm";
import { canPublish } from "@/lib/auth/rbac";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const session = await requireSession();
  const categories = await prisma.category.findMany({
    orderBy: { nameEn: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="font-display text-2xl font-semibold">New post</h1>
      <PostForm
        mode="create"
        categories={categories.map((c) => ({ id: c.id, nameEn: c.nameEn }))}
        canPublish={canPublish(session.user.role)}
      />
    </div>
  );
}
