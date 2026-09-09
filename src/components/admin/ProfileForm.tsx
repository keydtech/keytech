"use client";

import { updateProfile } from "@/lib/actions/admin";
import { uploadAvatar } from "@/lib/actions/upload";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export function ProfileForm({
  name,
  username,
  avatarUrl,
}: {
  name: string;
  username: string;
  avatarUrl?: string | null;
}) {
  const [form, setForm] = useState({
    name,
    username,
    currentPassword: "",
    newPassword: "",
    avatarUrl: avatarUrl ?? "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onAvatar(file: File) {
    try {
      const body = new FormData();
      body.set("file", file);
      const result = await uploadAvatar(body);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setForm((p) => ({ ...p, avatarUrl: result.url }));
      toast.success("Photo uploaded — save profile to apply");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (form.newPassword && form.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setBusy(true);
    try {
      const result = await updateProfile(form);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setForm((p) => ({ ...p, currentPassword: "", newPassword: "" }));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-lg space-y-4 rounded-2xl border border-white/10 bg-[#0c121e] p-6"
    >
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gradient-to-br from-navy to-[#123456] ring-2 ring-teal/40 ring-offset-2 ring-offset-[#0c121e]">
            {form.avatarUrl &&
            !form.avatarUrl.toLowerCase().includes("logo") ? (
              <Image
                src={form.avatarUrl}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : form.avatarUrl ? (
              <Image
                src="/images/avatar-keydtech.png"
                alt=""
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-display text-lg font-bold text-teal">
                {form.name.slice(0, 1).toUpperCase() || "?"}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">Profile photo</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Use a clear face photo (square). Full logos look unclear in the circle.
            </p>
            <input
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-xs text-slate-400"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onAvatar(file);
              }}
            />
          </div>
        </div>

      <label className="block text-sm">
        <span className="mb-1.5 block text-slate-200">Display name</span>
        <input
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
          className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-slate-200">Username</span>
        <input
          value={form.username}
          onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
          required
          className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-slate-200">Current password</span>
        <input
          type={showPassword ? "text" : "password"}
          value={form.currentPassword}
          onChange={(e) =>
            setForm((p) => ({ ...p, currentPassword: e.target.value }))
          }
          className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-slate-200">
          New password (optional, min 8)
        </span>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={form.newPassword}
            onChange={(e) =>
              setForm((p) => ({ ...p, newPassword: e.target.value }))
            }
            className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5 pr-16"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-teal"
          >
            {showPassword ? "Hide" : "View"}
          </button>
        </div>
      </label>
      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-midnight disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
