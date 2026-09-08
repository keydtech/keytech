import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { FileText, FolderOpen, Newspaper, Users } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireSession();

  const [published, drafts, categories, users, recent] = await Promise.all([
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.category.count(),
    prisma.user.count(),
    prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { author: { select: { name: true } } },
    }),
  ]);

  const cards = [
    { label: "Published posts", value: published, icon: Newspaper },
    { label: "Drafts", value: drafts, icon: FileText },
    { label: "Categories", value: categories, icon: FolderOpen },
    { label: "Users", value: users, icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            KeydTech content operations at a glance.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-midnight hover:bg-teal-dim"
        >
          New post
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-[#0c121e] p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{label}</p>
              <Icon className="h-4 w-4 text-teal" />
            </div>
            <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0c121e] p-5">
        <h2 className="font-display text-lg font-semibold">Recent posts</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-slate-400">
              <tr className="border-b border-white/10">
                <th className="py-2 pr-4 font-medium">Title</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Author</th>
                <th className="py-2 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((post) => (
                <tr key={post.id} className="border-b border-white/5">
                  <td className="py-3 pr-4">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="font-medium text-offwhite hover:text-teal"
                    >
                      {post.titleEn}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-slate-300">{post.status}</td>
                  <td className="py-3 pr-4 text-slate-300">
                    {post.author.name}
                  </td>
                  <td className="py-3 text-slate-400">
                    {post.updatedAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No posts yet. Create your first article.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-teal/20 bg-teal/5 p-5">
        <h2 className="font-display text-lg font-semibold text-teal">
          Insights
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          <li>
            Google Search is still early — publish bilingual posts weekly to grow
            clicks beyond the first milestone.
          </li>
          <li>
            Cloudflare shows strong traffic but low cache hit ratio. Keep Cache
            Rules for <code className="text-teal">/_next/static/*</code> and
            images on.
          </li>
          <li>
            Live Cloudflare / Search Console widgets can be wired later with API
            tokens.
          </li>
        </ul>
      </section>
    </div>
  );
}
