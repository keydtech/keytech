import { AdminShell } from "@/components/admin/AdminShell";
import { canManageCategories, canManageUsers } from "@/lib/auth/rbac";
import { requireSession } from "@/lib/auth/session";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <AdminShell
      userName={session.user.name}
      userRole={session.user.role}
      showUsers={canManageUsers(session.user.role)}
      showCategories={canManageCategories(session.user.role)}
    >
      {children}
    </AdminShell>
  );
}
