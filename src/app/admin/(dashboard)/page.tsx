import {
  canEditAllPosts,
  canManageCategories,
  canManageClients,
  canManageUsers,
} from "@/lib/auth/rbac";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import {
  FileText,
  FolderOpen,
  Handshake,
  Newspaper,
  Users,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requireSession();
  const role = session.user.role;
  const userId = session.user.id;
  const isAuthor = role === Role.AUTHOR;
  const seeAllPosts = canEditAllPosts(role);
  const seeCategories = canManageCategories(role);
  const seeUsers = canManageUsers(role);
  const seeClients = canManageClients(role);
  const seeInsights = !isAuthor;

  const authorFilter = seeAllPosts ? {} : { authorId: userId };

  const [published, drafts, pendingReview, categories, users, clients, recent] =
    await Promise.all([
      prisma.post.count({
        where: { status: "PUBLISHED", ...authorFilter },
      }),
      prisma.post.count({
        where: { status: "DRAFT", ...authorFilter },
      }),
      prisma.post.count({
        where: { status: "PENDING_REVIEW", ...authorFilter },
      }),
      seeCategories ? prisma.category.count() : Promise.resolve(0),
      seeUsers ? prisma.user.count() : Promise.resolve(0),
      seeClients ? prisma.client.count() : Promise.resolve(0),
      prisma.post.findMany({
        where: authorFilter,
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: { author: { select: { name: true } } },
      }),
    ]);

  const cards = [
    {
      label: isAuthor ? "My published posts" : "Published posts",
      value: published,
      icon: Newspaper,
      show: true,
      href: "/admin/posts",
    },
    {
      label: isAuthor ? "My drafts" : "Drafts",
      value: drafts,
      icon: FileText,
      show: true,
      href: "/admin/posts",
    },
    {
      label: isAuthor ? "Awaiting review" : "Pending review",
      value: pendingReview,
      icon: FileText,
      show: true,
      href: "/admin/posts",
    },
    {
      label: "Clients",
      value: clients,
      icon: Handshake,
      show: seeClients,
      href: "/admin/clients",
    },
    {
      label: "Categories",
      value: categories,
      icon: FolderOpen,
      show: seeCategories,
      href: "/admin/categories",
    },
    {
      label: "Users",
      value: users,
      icon: Users,
      show: seeUsers,
      href: "/admin/users",
    },
  ].filter((card) => card.show);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {isAuthor
              ? "Your articles and drafts at a glance."
              : "KeydTech content operations at a glance."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {seeClients ? (
            <Link
              href="/admin/clients"
              className="rounded-xl border border-teal/40 px-4 py-2.5 text-sm font-semibold text-teal hover:bg-teal/10"
            >
              Manage clients
            </Link>
          ) : null}
          <Link
            href="/admin/posts/new"
            className="rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-midnight hover:bg-teal-dim"
          >
            New post
          </Link>
        </div>
      </div>

      <div
        className={`grid gap-4 sm:grid-cols-2 ${
          cards.length >= 4 ? "xl:grid-cols-3 2xl:grid-cols-4" : "xl:grid-cols-3"
        }`}
      >
        {cards.map(({ label, value, icon: Icon, href }) => {
          const body = (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{label}</p>
                <Icon className="h-4 w-4 text-teal" />
              </div>
              <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
            </>
          );
          return href ? (
            <Link
              key={label}
              href={href}
              className="rounded-2xl border border-white/10 bg-[#0c121e] p-5 transition hover:border-teal/40"
            >
              {body}
            </Link>
          ) : (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-[#0c121e] p-5"
            >
              {body}
            </div>
          );
        })}
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0c121e] p-5">
        <h2 className="font-display text-lg font-semibold">
          {isAuthor ? "My recent posts" : "Recent posts"}
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-slate-400">
              <tr className="border-b border-white/10">
                <th className="py-2 pr-4 font-medium">Title</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                {!isAuthor ? (
                  <th className="py-2 pr-4 font-medium">Author</th>
                ) : null}
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
                  {!isAuthor ? (
                    <td className="py-3 pr-4 text-slate-300">
                      {post.author.name}
                    </td>
                  ) : null}
                  <td className="py-3 text-slate-400">
                    {post.updatedAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recent.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAuthor ? 3 : 4}
                    className="py-8 text-center text-slate-400"
                  >
                    No posts yet. Create your first article.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {seeInsights ? (
        <section className="rounded-2xl border border-teal/20 bg-teal/5 p-5">
          <h2 className="font-display text-lg font-semibold text-teal">
            Insights
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>
              Google Search is still early — publish bilingual posts weekly to
              grow clicks beyond the first milestone.
            </li>
            <li>
              Cloudflare shows strong traffic but low cache hit ratio. Keep Cache
              Rules for <code className="text-teal">/_next/static/*</code> and
              images on.
            </li>
            <li>
              Live Cloudflare / Search Console widgets can be wired later with
              API tokens.
            </li>
          </ul>
        </section>
      ) : null}
    </div>
  );
}
