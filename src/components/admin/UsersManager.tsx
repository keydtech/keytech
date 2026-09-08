"use client";

import {
  createUser,
  deleteUser,
  setUserActive,
  updateUser,
} from "@/lib/actions/admin";
import { uploadAvatar } from "@/lib/actions/upload";
import { Role } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

type UserRow = {
  id: string;
  name: string;
  username: string;
  email: string | null;
  role: Role;
  active: boolean;
  avatarUrl: string | null;
};

const emptyForm = {
  name: "",
  username: "",
  email: "",
  password: "",
  role: "AUTHOR" as Role,
  avatarUrl: "",
};

function roleLabel(role: Role) {
  if (role === "SUPER_ADMIN") return "Super Admin";
  if (role === "EDITOR") return "Editor";
  return "Author";
}

export function UsersManager({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const isEditing = editingId !== null;

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowPassword(false);
  }

  function startEdit(user: UserRow) {
    setEditingId(user.id);
    setForm({
      name: user.name,
      username: user.username,
      email: user.email ?? "",
      password: "",
      role: user.role,
      avatarUrl: user.avatarUrl ?? "",
    });
    setShowPassword(false);
  }

  async function onAvatar(file: File) {
    try {
      const body = new FormData();
      body.set("file", file);
      const url = await uploadAvatar(body);
      setForm((p) => ({ ...p, avatarUrl: url }));
      toast.success("Photo ready — save user to apply");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (form.password && form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!isEditing && form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setBusy(true);
    try {
      if (isEditing && editingId) {
        const result = await updateUser(editingId, form);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("User updated");
        startCreate();
      } else {
        const result = await createUser(form);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("User created");
        startCreate();
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function onToggleActive(user: UserRow) {
    setBusy(true);
    try {
      const result = await setUserActive(user.id, !user.active);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(user.active ? "User disabled" : "User enabled");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(user: UserRow) {
    if (
      !window.confirm(`Delete user “${user.username}”? This cannot be undone.`)
    ) {
      return;
    }
    setBusy(true);
    try {
      const result = await deleteUser(user.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (editingId === user.id) startCreate();
      toast.success("User deleted");
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
        onSubmit={onSubmit}
        className="grid gap-3 rounded-2xl border border-white/10 bg-[#0c121e] p-5 md:grid-cols-2"
      >
        <div className="flex items-center justify-between gap-3 md:col-span-2">
          <h2 className="font-display text-lg font-semibold">
            {isEditing ? "Edit user" : "Create user"}
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

        <div className="flex items-center gap-4 md:col-span-2">
          <div className="relative h-14 w-14 overflow-hidden rounded-full bg-gradient-to-br from-navy to-[#123456] ring-2 ring-teal/30">
            {form.avatarUrl &&
            !form.avatarUrl.toLowerCase().includes("logo") ? (
              <Image
                src={form.avatarUrl}
                alt=""
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <Image
                src="/images/avatar-keydtech.png"
                alt=""
                fill
                className="object-cover"
                sizes="56px"
              />
            )}
          </div>
          <label className="block text-sm">
            <span className="mb-1.5 block text-slate-300">Profile photo</span>
            <span className="mb-1.5 block text-xs text-slate-500">
              Face photo works best — avoid uploading the full logo.
            </span>
            <input
              type="file"
              accept="image/*"
              className="block w-full text-xs text-slate-400"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onAvatar(file);
              }}
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1.5 block text-slate-300">Full name</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-slate-300">Username</span>
          <input
            required
            value={form.username}
            onChange={(e) =>
              setForm((p) => ({ ...p, username: e.target.value }))
            }
            className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-slate-300">Email (optional)</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-slate-300">
            {isEditing ? "New password (optional)" : "Password (min 8)"}
          </span>
          <div className="relative">
            <input
              required={!isEditing}
              minLength={isEditing ? undefined : 8}
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
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
        <label className="block text-sm md:col-span-2">
          <span className="mb-1.5 block text-slate-300">Role</span>
          <select
            value={form.role}
            onChange={(e) =>
              setForm((p) => ({ ...p, role: e.target.value as Role }))
            }
            className="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
          >
            <option value="AUTHOR">Author — drafts only</option>
            <option value="EDITOR">Editor — can publish</option>
            <option value="SUPER_ADMIN">Super Admin — full access</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-midnight disabled:opacity-60 md:col-span-2"
        >
          {busy ? "Saving…" : isEditing ? "Save changes" : "Create user"}
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0c121e]">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="text-slate-400">
            <tr className="border-b border-white/10">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <tr
                  key={user.id}
                  className={`border-b border-white/5 ${
                    editingId === user.id ? "bg-teal/5" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 overflow-hidden rounded-full bg-teal/15">
        {user.avatarUrl ? (
                          <Image
                            src={
                              user.avatarUrl.toLowerCase().includes("logo")
                                ? "/images/avatar-keydtech.png"
                                : user.avatarUrl
                            }
                            alt=""
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        ) : (
                          <Image
                            src="/images/avatar-keydtech.png"
                            alt=""
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        )}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{user.username}</td>
                  <td className="px-4 py-3">{roleLabel(user.role)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={user.active ? "text-teal" : "text-amber-400"}
                    >
                      {user.active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => startEdit(user)}
                        className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-semibold text-offwhite hover:border-teal/50 hover:text-teal disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={busy || isSelf}
                        onClick={() => void onToggleActive(user)}
                        className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-semibold text-teal hover:bg-teal/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {user.active ? "Disable" : "Enable"}
                      </button>
                      <button
                        type="button"
                        disabled={busy || isSelf}
                        onClick={() => void onDelete(user)}
                        className="rounded-lg border border-red-500/30 px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
