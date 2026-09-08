"use client";

import { updateProfile } from "@/lib/actions/admin";
import { FormEvent, useState } from "react";

export function ProfileForm({
  name,
  username,
}: {
  name: string;
  username: string;
}) {
  const [form, setForm] = useState({
    name,
    username,
    currentPassword: "",
    newPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await updateProfile(form);
      setForm((p) => ({ ...p, currentPassword: "", newPassword: "" }));
      setMessage("Profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-lg space-y-4 rounded-2xl border border-white/10 bg-[#0c121e] p-6"
    >
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
        <span className="mb-1.5 block text-slate-200">New password</span>
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
      {message ? <p className="text-sm text-teal">{message}</p> : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button
        type="submit"
        className="rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-midnight"
      >
        Save profile
      </button>
    </form>
  );
}
