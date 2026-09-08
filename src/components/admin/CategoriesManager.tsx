"use client";

import { createCategory, deleteCategory } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type CategoryRow = {
  id: string;
  slug: string;
  nameEn: string;
  nameSo: string;
};

export function CategoriesManager({
  categories,
  canManage,
}: {
  categories: CategoryRow[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    nameEn: "",
    nameSo: "",
    slug: "",
  });
  const [error, setError] = useState<string | null>(null);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    if (!canManage) return;
    setError(null);
    try {
      await createCategory(form);
      setForm({ nameEn: "", nameSo: "", slug: "" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  async function onDelete(id: string) {
    if (!canManage) return;
    if (!window.confirm("Delete this category?")) return;
    await deleteCategory(id);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {canManage ? (
        <form
          onSubmit={onCreate}
          className="grid gap-3 rounded-2xl border border-white/10 bg-[#0c121e] p-5 md:grid-cols-2"
        >
          <h2 className="font-display text-lg font-semibold md:col-span-2">
            Add category
          </h2>
          <input
            placeholder="Name EN"
            value={form.nameEn}
            onChange={(e) => setForm((p) => ({ ...p, nameEn: e.target.value }))}
            required
            className="rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
          />
          <input
            placeholder="Name SO"
            value={form.nameSo}
            onChange={(e) => setForm((p) => ({ ...p, nameSo: e.target.value }))}
            required
            className="rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
          />
          <input
            placeholder="Slug (optional)"
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            className="rounded-xl border border-white/10 bg-midnight px-3 py-2.5 md:col-span-2"
          />
          <button
            type="submit"
            className="rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-midnight md:col-span-2"
          >
            Create category
          </button>
          {error ? (
            <p className="text-sm text-red-400 md:col-span-2">{error}</p>
          ) : null}
        </form>
      ) : (
        <p className="text-sm text-slate-400">
          Only editors and admins can manage categories.
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0c121e]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-slate-400">
            <tr className="border-b border-white/10">
              <th className="px-4 py-3">EN</th>
              <th className="px-4 py-3">SO</th>
              <th className="px-4 py-3">Slug</th>
              {canManage ? <th className="px-4 py-3">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-white/5">
                <td className="px-4 py-3">{category.nameEn}</td>
                <td className="px-4 py-3">{category.nameSo}</td>
                <td className="px-4 py-3 text-slate-400">{category.slug}</td>
                {canManage ? (
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void onDelete(category.id)}
                      className="text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
