"use client";

import {
  createUser,
  deleteUser,
  setUserActive,
  updateUserRole,
} from "@/lib/actions/admin";
import { Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type UserRow = {
  id: string;
  name: string;
  username: string;
  email: string | null;
  role: Role;
  active: boolean;
};

export function UsersManager({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "AUTHOR" as Role,
  });

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createUser(form);
      setForm({
        name: "",
        username: "",
        email: "",
        password: "",
        role: "AUTHOR",
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={onCreate}
        className="grid gap-3 rounded-2xl border border-white/10 bg-[#0c121e] p-5 md:grid-cols-2"
      >
        <h2 className="font-display text-lg font-semibold md:col-span-2">
          Create user
        </h2>
        <input
          placeholder="Full name"
          required
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className="rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
        />
        <input
          placeholder="Username"
          required
          value={form.username}
          onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
          className="rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
        />
        <input
          placeholder="Email (optional)"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          className="rounded-xl border border-white/10 bg-midnight px-3 py-2.5"
        />
        <div className="relative">
          <input
            placeholder="Password"
            required
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
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
        <select
          value={form.role}
          onChange={(e) =>
            setForm((p) => ({ ...p, role: e.target.value as Role }))
          }
          className="rounded-xl border border-white/10 bg-midnight px-3 py-2.5 md:col-span-2"
        >
          <option value="AUTHOR">Author</option>
          <option value="EDITOR">Editor</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-midnight md:col-span-2"
        >
          Create user
        </button>
        {error ? (
          <p className="text-sm text-red-400 md:col-span-2">{error}</p>
        ) : null}
      </form>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0c121e]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-slate-400">
            <tr className="border-b border-white/10">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-white/5">
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">{user.username}</td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      void updateUserRole(user.id, e.target.value as Role).then(
                        () => router.refresh(),
                      )
                    }
                    className="rounded-lg border border-white/10 bg-midnight px-2 py-1"
                    disabled={user.id === currentUserId}
                  >
                    <option value="AUTHOR">Author</option>
                    <option value="EDITOR">Editor</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  {user.active ? "Active" : "Disabled"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="text-teal"
                      disabled={user.id === currentUserId}
                      onClick={() =>
                        void setUserActive(user.id, !user.active).then(() =>
                          router.refresh(),
                        )
                      }
                    >
                      {user.active ? "Disable" : "Enable"}
                    </button>
                    <button
                      type="button"
                      className="text-red-400"
                      disabled={user.id === currentUserId}
                      onClick={() => {
                        if (!window.confirm("Delete this user?")) return;
                        void deleteUser(user.id).then(() => router.refresh());
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
