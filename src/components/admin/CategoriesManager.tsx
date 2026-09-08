"use client";

import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/actions/admin";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

type CategoryRow = {
  id: string;
  slug: string;
  nameEn: string;
  nameSo: string;
};

const emptyForm = {
  nameEn: "",
  nameSo: "",
  slug: "",
};

export function CategoriesManager({
  categories,
  canManage,
}: {
  categories: CategoryRow[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isEditing = editingId !== null;

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(category: CategoryRow) {
    setEditingId(category.id);
    setForm({
      nameEn: category.nameEn,
      nameSo: category.nameSo,
      slug: category.slug,
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canManage) return;
    setBusy(true);
    try {
      if (isEditing && editingId) {
        const result = await updateCategory(editingId, form);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Category updated");
      } else {
        const result = await createCategory(form);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Category created");
      }
      startCreate();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(category: CategoryRow) {
    if (!canManage) return;
    if (
      !window.confirm(
        `Delete category “${category.nameEn}”? Posts stay, but this tag is removed.`,
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const result = await deleteCategory(category.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (editingId === category.id) startCreate();
      toast.success("Category deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      {canManage ? (
        <form
          onSubmit={onSubmit}
          className="grid gap-3 rounded-2xl border border-white/10 bg-[#0c121e] p-5 md:grid-cols-2"
        >
          <div className="flex items-center justify-between gap-3 md:col-span-2">
            <h2 className="font-display text-lg font-semibold">
              {isEditing ? "Edit category" : "Add category"}
            </h2>
            {isEditing ? (
              <button
                type="button"
                onClick={startCreate}
                className="text-sm font-medium text-slate-400 hover:text-teal"
              >
                Cancel edit
              </button>
            ) : null}
          </div>
          <label className="block text-sm">
            <span className="mb-1.5 block text-slate-300">Name EN</span>
            <input
              value={form.nameEn}
              onChange={(e) =>
                setForm((p) => ({ ...p, nameEn: e.target.value }))
              }
              required
              minLength={2}
              className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-slate-300">Name SO</span>
            <input
              value={form.nameSo}
              onChange={(e) =>
                setForm((p) => ({ ...p, nameSo: e.target.value }))
              }
              required
              minLength={2}
              className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1.5 block text-slate-300">
              Slug (optional — auto from EN name)
            </span>
            <input
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-midnight disabled:opacity-60 md:col-span-2"
          >
            {busy
              ? "Saving…"
              : isEditing
                ? "Save changes"
                : "Create category"}
          </button>
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
              <tr
                key={category.id}
                className={`border-b border-white/5 ${
                  editingId === category.id ? "bg-teal/5" : ""
                }`}
              >
                <td className="px-4 py-3 font-medium">{category.nameEn}</td>
                <td className="px-4 py-3">{category.nameSo}</td>
                <td className="px-4 py-3 text-slate-400">{category.slug}</td>
                {canManage ? (
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => startEdit(category)}
                        className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-semibold text-offwhite hover:border-teal/50 hover:text-teal disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void onDelete(category)}
                        className="rounded-lg border border-red-500/30 px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
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
