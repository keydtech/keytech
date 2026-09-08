import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { canManageCategories } from "@/lib/auth/rbac";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const session = await requireSession();
  const categories = await prisma.category.findMany({
    orderBy: { nameEn: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Categories</h1>
        <p className="text-sm text-slate-400">
          Organize posts for filters on the public blog.
        </p>
      </div>
      <CategoriesManager
        categories={categories}
        canManage={canManageCategories(session.user.role)}
      />
    </div>
  );
}
