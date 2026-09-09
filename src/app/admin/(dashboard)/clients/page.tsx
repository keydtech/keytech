import { ClientsManager } from "@/components/admin/ClientsManager";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  await requireRole(["SUPER_ADMIN"]);

  const [clients, settings] = await Promise.all([
    prisma.client.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.siteSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        yearsExperience: 8,
        projectsCompleted: 48,
        expertsOnTeam: 12,
      },
      update: {},
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Clients</h1>
        <p className="text-sm text-slate-400">
          Manage partners shown on the public site. Super Admin only.
        </p>
      </div>
      <ClientsManager
        clients={clients}
        stats={{
          yearsExperience: settings.yearsExperience,
          projectsCompleted: settings.projectsCompleted,
          expertsOnTeam: settings.expertsOnTeam,
        }}
      />
    </div>
  );
}
