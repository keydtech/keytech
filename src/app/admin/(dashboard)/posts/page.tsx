import { DeletePostButton } from "@/components/admin/DeletePostButton";
import { canPublish } from "@/lib/auth/rbac";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const session = await requireSession();
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      author: { select: { id: true, name: true } },
    },
  });

  const visible = canPublish(session.user.role)
    ? posts
    : posts.filter((post) => post.authorId === session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Posts</h1>
          <p className="text-sm text-slate-400">
            Create and manage blog articles.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-midnight"
        >
          New post
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0c121e]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-slate-400">
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Author</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((post) => (
              <tr key={post.id} className="border-b border-white/5">
                <td className="px-4 py-3 font-medium">{post.titleEn}</td>
                <td className="px-4 py-3">{post.status}</td>
                <td className="px-4 py-3">{post.author.name}</td>
                <td className="px-4 py-3 text-slate-400">
                  {post.updatedAt.toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-semibold text-offwhite hover:border-teal/50 hover:text-teal"
                    >
                      Edit
                    </Link>
                    <DeletePostButton id={post.id} />
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  No posts yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
