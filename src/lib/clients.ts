import { prisma } from "@/lib/db";

export async function getPublishedClients() {
  return prisma.client.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getSiteStats() {
  const [settings, clientsCount] = await Promise.all([
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
    prisma.client.count({ where: { published: true } }),
  ]);

  return {
    yearsExperience: settings.yearsExperience,
    projectsCompleted: settings.projectsCompleted,
    expertsOnTeam: settings.expertsOnTeam,
    clientsCount,
  };
}
