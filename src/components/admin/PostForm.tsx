"use client";

import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { createPost, updatePost } from "@/lib/actions/admin";
import { uploadCoverImage } from "@/lib/actions/upload";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

type CategoryOption = { id: string; nameEn: string };

type PostFormProps = {
  mode: "create" | "edit";
  postId?: string;
  categories: CategoryOption[];
  canPublish: boolean;
  initial?: {
    slug: string;
    titleEn: string;
    titleSo: string;
    excerptEn: string;
    excerptSo: string;
    contentEn: string;
    contentSo: string;
    coverImageUrl: string;
    status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED";
    categoryIds: string[];
    seoTitleEn: string;
    seoTitleSo: string;
    seoDescEn: string;
    seoDescSo: string;
  };
};

export function PostForm({
  mode,
  postId,
  categories,
  canPublish,
  initial,
}: PostFormProps) {
  const router = useRouter();
  const [localeTab, setLocaleTab] = useState<"en" | "so">("en");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    slug: initial?.slug ?? "",
    titleEn: initial?.titleEn ?? "",
    titleSo: initial?.titleSo ?? "",
    excerptEn: initial?.excerptEn ?? "",
    excerptSo: initial?.excerptSo ?? "",
    contentEn: initial?.contentEn ?? "",
    contentSo: initial?.contentSo ?? "",
    coverImageUrl: initial?.coverImageUrl ?? "",
    status: (() => {
      const s = initial?.status ?? ("DRAFT" as const);
      if (!canPublish && (s === "PUBLISHED" || s === "ARCHIVED")) {
        return "DRAFT" as const;
      }
      return s;
    })(),
    categoryIds: initial?.categoryIds ?? ([] as string[]),
    seoTitleEn: initial?.seoTitleEn ?? "",
    seoTitleSo: initial?.seoTitleSo ?? "",
    seoDescEn: initial?.seoDescEn ?? "",
    seoDescSo: initial?.seoDescSo ?? "",
  });

  function toggleCategory(id: string) {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((item) => item !== id)
        : [...prev.categoryIds, id],
    }));
  }

  async function onUpload(file: File) {
    try {
      const body = new FormData();
      body.set("file", file);
      const url = await uploadCoverImage(body);
      setForm((prev) => ({ ...prev, coverImageUrl: url }));
      toast.success("Cover image uploaded");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      if (mode === "create") {
        const id = await createPost(form);
        toast.success(
          form.status === "PENDING_REVIEW"
            ? "Submitted for review"
            : "Post created",
        );
        router.push(`/admin/posts/${id}/edit`);
      } else if (postId) {
        const result = await updatePost(postId, form);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success(
          form.status === "PENDING_REVIEW"
            ? "Submitted for review"
            : "Post saved",
        );
        router.refresh();
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Failed to save";
      const message =
        raw.includes("Minified React error #441") ||
        raw.includes("Server Components render")
          ? "Server error while saving. Try again in a moment."
          : raw;
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {!canPublish && initial?.status === "PUBLISHED" ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          This post is live. Saving as an author unpublishes it until an editor
          or admin approves again — use “Submit for review” when ready.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {(["en", "so"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setLocaleTab(tab)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold uppercase ${
              localeTab === tab
                ? "bg-teal text-midnight"
                : "bg-white/5 text-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {localeTab === "en" ? (
        <div className="space-y-4">
          <Field
            label="Title (EN)"
            value={form.titleEn}
            onChange={(v) => setForm((p) => ({ ...p, titleEn: v }))}
            required
          />
          <Field
            label="Excerpt (EN)"
            value={form.excerptEn}
            onChange={(v) => setForm((p) => ({ ...p, excerptEn: v }))}
            textarea
          />
          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-200">
              Content (EN)
            </p>
            <RichTextEditor
              value={form.contentEn}
              onChange={(v) => setForm((p) => ({ ...p, contentEn: v }))}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Field
            label="Title (SO)"
            value={form.titleSo}
            onChange={(v) => setForm((p) => ({ ...p, titleSo: v }))}
            required
          />
          <Field
            label="Excerpt (SO)"
            value={form.excerptSo}
            onChange={(v) => setForm((p) => ({ ...p, excerptSo: v }))}
            textarea
          />
          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-200">
              Content (SO)
            </p>
            <RichTextEditor
              value={form.contentSo}
              onChange={(v) => setForm((p) => ({ ...p, contentSo: v }))}
            />
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Slug"
          value={form.slug}
          onChange={(v) => setForm((p) => ({ ...p, slug: v }))}
          placeholder="auto-from-title"
        />
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-200">Status</span>
          <select
            value={form.status}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                status: e.target.value as typeof form.status,
              }))
            }
            className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5 text-offwhite"
          >
            <option value="DRAFT">Draft</option>
            {!canPublish ? (
              <option value="PENDING_REVIEW">Submit for review</option>
            ) : null}
            {canPublish ? (
              <>
                <option value="PENDING_REVIEW">Pending review</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </>
            ) : null}
          </select>
          {!canPublish ? (
            <span className="mt-1 block text-xs text-slate-400">
              Authors cannot publish. Choose “Submit for review” so an editor
              or admin can approve it for the public site.
            </span>
          ) : (
            <span className="mt-1 block text-xs text-slate-400">
              Approve pending posts to make them public, or publish directly.
            </span>
          )}
        </label>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-200">Categories</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const active = form.categoryIds.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  active
                    ? "bg-teal text-midnight"
                    : "border border-white/10 text-slate-300"
                }`}
              >
                {category.nameEn}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Field
          label="Cover image URL"
          value={form.coverImageUrl}
          onChange={(v) => setForm((p) => ({ ...p, coverImageUrl: v }))}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              void onUpload(file).catch((err) => {
                toast.error(err instanceof Error ? err.message : String(err));
              });
            }
          }}
          className="text-sm text-slate-300"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="SEO title EN"
          value={form.seoTitleEn}
          onChange={(v) => setForm((p) => ({ ...p, seoTitleEn: v }))}
        />
        <Field
          label="SEO title SO"
          value={form.seoTitleSo}
          onChange={(v) => setForm((p) => ({ ...p, seoTitleSo: v }))}
        />
        <Field
          label="SEO description EN"
          value={form.seoDescEn}
          onChange={(v) => setForm((p) => ({ ...p, seoDescEn: v }))}
          textarea
        />
        <Field
          label="SEO description SO"
          value={form.seoDescSo}
          onChange={(v) => setForm((p) => ({ ...p, seoDescSo: v }))}
          textarea
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-midnight hover:bg-teal-dim disabled:opacity-60"
      >
        {saving ? "Saving…" : mode === "create" ? "Create post" : "Save changes"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  required?: boolean;
  placeholder?: string;
}) {
  const className =
    "w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5 text-offwhite outline-none ring-teal focus:ring-2";
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-slate-200">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={className}
          required={required}
          placeholder={placeholder}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
          required={required}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}
