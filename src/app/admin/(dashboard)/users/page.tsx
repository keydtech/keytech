import { UsersManager } from "@/components/admin/UsersManager";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await requireRole(["SUPER_ADMIN"]);
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      active: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Users</h1>
        <p className="text-sm text-slate-400">
          Create accounts and assign Super Admin, Editor, or Author roles.
        </p>
      </div>
      <UsersManager users={users} currentUserId={session.user.id} />
    </div>
  );
}
