"use client";

import {
  createClient,
  deleteClient,
  updateClient,
  updateSiteStats,
} from "@/lib/actions/clients";
import { uploadClientLogo } from "@/lib/actions/upload";
import type { ClientIndustry, ClientWorkType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export type ClientRow = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  industry: ClientIndustry;
  workType: ClientWorkType;
  descriptionEn: string;
  descriptionSo: string;
  websiteUrl: string | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
};

const INDUSTRIES: ClientIndustry[] = [
  "RETAIL",
  "PHARMACY",
  "ELECTRONICS",
  "WHOLESALE",
  "SERVICES",
  "MANUFACTURING",
  "NGO",
  "GOVERNMENT",
  "OTHER",
];

const WORK_TYPES: ClientWorkType[] = [
  "ODOO",
  "WEBSITE",
  "APP",
  "SYSTEM",
  "POS_RETAIL",
  "OTHER",
];

const emptyForm = {
  name: "",
  slug: "",
  logoUrl: "",
  industry: "RETAIL" as ClientIndustry,
  workType: "ODOO" as ClientWorkType,
  descriptionEn: "",
  descriptionSo: "",
  websiteUrl: "",
  featured: true,
  published: true,
  sortOrder: 0,
};

export function ClientsManager({
  clients,
  stats,
}: {
  clients: ClientRow[];
  stats: {
    yearsExperience: number;
    projectsCompleted: number;
    expertsOnTeam: number;
  };
}) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statForm, setStatForm] = useState(stats);

  const isEditing = editingId !== null;

  function startCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, sortOrder: clients.length });
  }

  function startEdit(client: ClientRow) {
    setEditingId(client.id);
    setForm({
      name: client.name,
      slug: client.slug,
      logoUrl: client.logoUrl ?? "",
      industry: client.industry,
      workType: client.workType,
      descriptionEn: client.descriptionEn,
      descriptionSo: client.descriptionSo,
      websiteUrl: client.websiteUrl ?? "",
      featured: client.featured,
      published: client.published,
      sortOrder: client.sortOrder,
    });
  }

  async function onUpload(file: File) {
    setUploading(true);
    const toastId = toast.loading("Uploading logo…");
    try {
      if (!file.type && !/\.(jpe?g|png|webp|gif)$/i.test(file.name)) {
        toast.error("Only JPEG, PNG, WebP, or GIF images are allowed", {
          id: toastId,
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB", { id: toastId });
        return;
      }

      const body = new FormData();
      body.set("file", file);
      const result = await uploadClientLogo(body);
      if (!result.ok) {
        toast.error(result.error, { id: toastId });
        return;
      }
      setForm((prev) => ({ ...prev, logoUrl: result.url }));
      toast.success("Logo uploaded — now click Save client", { id: toastId });
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Upload failed";
      const message =
        raw.includes("Minified React error #441") ||
        raw.includes("Server Components render")
          ? "Logo upload failed. Use a JPEG/PNG under 5MB and try again."
          : raw;
      toast.error(message, { id: toastId });
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (uploading) {
      toast.error("Wait for the logo upload to finish, then save");
      return;
    }
    if (!form.logoUrl.trim()) {
      // Allow save without logo, but warn clearly.
      toast.message("Saving without a logo URL");
    }
    setBusy(true);
    try {
      const payload = { ...form };
      const result =
        isEditing && editingId
          ? await updateClient(editingId, payload)
          : await createClient(payload);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(isEditing ? "Client updated" : "Client created");
      startCreate();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(client: ClientRow) {
    if (!window.confirm(`Delete client “${client.name}”?`)) return;
    setBusy(true);
    try {
      const result = await deleteClient(client.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (editingId === client.id) startCreate();
      toast.success("Client deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function onSaveStats(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await updateSiteStats(statForm);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Stats updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={onSaveStats}
        className="grid gap-3 rounded-2xl border border-teal/20 bg-teal/5 p-5 sm:grid-cols-4"
      >
        <h2 className="font-display text-lg font-semibold sm:col-span-4">
          Trust stats (home page)
        </h2>
        <label className="text-sm">
          <span className="mb-1 block text-slate-300">Years expertise</span>
          <input
            type="number"
            min={1}
            value={statForm.yearsExperience}
            onChange={(e) =>
              setStatForm((p) => ({
                ...p,
                yearsExperience: Number(e.target.value),
              }))
            }
            className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-300">Projects completed</span>
          <input
            type="number"
            min={0}
            value={statForm.projectsCompleted}
            onChange={(e) =>
              setStatForm((p) => ({
                ...p,
                projectsCompleted: Number(e.target.value),
              }))
            }
            className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-300">Experts on team</span>
          <input
            type="number"
            min={1}
            value={statForm.expertsOnTeam}
            onChange={(e) =>
              setStatForm((p) => ({
                ...p,
                expertsOnTeam: Number(e.target.value),
              }))
            }
            className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
          />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-midnight disabled:opacity-60"
          >
            Save stats
          </button>
        </div>
      </form>

      <form
        onSubmit={onSubmit}
        className="grid gap-3 rounded-2xl border border-white/10 bg-[#0c121e] p-5 md:grid-cols-2"
      >
        <div className="flex items-center justify-between gap-3 md:col-span-2">
          <h2 className="font-display text-lg font-semibold">
            {isEditing ? "Edit client" : "Add client"}
          </h2>
          {isEditing ? (
            <button
              type="button"
              onClick={startCreate}
              className="text-xs font-semibold text-teal hover:underline"
            >
              Cancel edit
            </button>
          ) : null}
        </div>

        <label className="text-sm">
          <span className="mb-1 block text-slate-300">Company name</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-300">Slug (optional)</span>
          <input
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-300">Industry / type</span>
          <select
            value={form.industry}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                industry: e.target.value as ClientIndustry,
              }))
            }
            className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
          >
            {INDUSTRIES.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-300">Work delivered</span>
          <select
            value={form.workType}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                workType: e.target.value as ClientWorkType,
              }))
            }
            className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
          >
            {WORK_TYPES.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm md:col-span-2">
          <span className="mb-1 block text-slate-300">Logo</span>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {form.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.logoUrl}
                alt=""
                className="h-14 w-14 rounded-xl border border-white/10 bg-white object-contain p-1"
              />
            ) : null}
            <input
              value={form.logoUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, logoUrl: e.target.value }))
              }
              placeholder="https://… or /uploads/clients/…"
              className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
            />
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,.jpeg,.jpg,.png,.webp,.gif"
              disabled={uploading || busy}
              onChange={(e) => {
                const input = e.currentTarget;
                const file = input.files?.[0];
                if (file) {
                  void onUpload(file).finally(() => {
                    input.value = "";
                  });
                }
              }}
              className="text-xs text-slate-300 disabled:opacity-50"
            />
          </div>
          {uploading ? (
            <p className="mt-1 text-xs text-teal">Uploading logo… wait until the URL appears, then save.</p>
          ) : null}
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-300">Description EN</span>
          <textarea
            rows={2}
            value={form.descriptionEn}
            onChange={(e) =>
              setForm((p) => ({ ...p, descriptionEn: e.target.value }))
            }
            className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-300">Description SO</span>
          <textarea
            rows={2}
            value={form.descriptionSo}
            onChange={(e) =>
              setForm((p) => ({ ...p, descriptionSo: e.target.value }))
            }
            className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-300">Website (https)</span>
          <input
            value={form.websiteUrl}
            onChange={(e) =>
              setForm((p) => ({ ...p, websiteUrl: e.target.value }))
            }
            className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-300">Sort order</span>
          <input
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(e) =>
              setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))
            }
            className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) =>
              setForm((p) => ({ ...p, featured: e.target.checked }))
            }
          />
          Featured on home
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) =>
              setForm((p) => ({ ...p, published: e.target.checked }))
            }
          />
          Published
        </label>

        <button
          type="submit"
          disabled={busy || uploading}
          className="rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-midnight disabled:opacity-60 md:col-span-2"
        >
          {uploading
            ? "Uploading logo…"
            : busy
              ? "Saving…"
              : isEditing
                ? "Save client"
                : "Add client"}
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0c121e]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-slate-400">
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Industry</th>
              <th className="px-4 py-3 font-medium">Work</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b border-white/5">
                <td className="px-4 py-3 font-medium">{client.name}</td>
                <td className="px-4 py-3 text-slate-300">
                  {client.industry.replaceAll("_", " ")}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {client.workType.replaceAll("_", " ")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      client.published ? "text-teal" : "text-amber-300"
                    }
                  >
                    {client.published ? "Published" : "Hidden"}
                    {client.featured ? " · Featured" : ""}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(client)}
                      className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-semibold hover:text-teal"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void onDelete(client)}
                      className="rounded-lg border border-red-500/30 px-2.5 py-1 text-xs font-semibold text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  No clients yet — add your first partner above.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
