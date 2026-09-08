"use client";

import { cn } from "@/lib/utils";
import {
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/profile", label: "Profile", icon: UserRound },
] as const;

type AdminShellProps = {
  userName: string;
  userRole: string;
  showUsers?: boolean;
  showCategories?: boolean;
  children: React.ReactNode;
};

export function AdminShell({
  userName,
  userRole,
  showUsers = false,
  showCategories = true,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = NAV.filter((item) => {
    if (item.href === "/admin/users" && !showUsers) return false;
    if (item.href === "/admin/categories" && !showCategories) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#070b12] text-offwhite">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-[#0c121e] p-5 transition-transform lg:static lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between">
            <Link href="/admin" className="font-display text-xl font-bold">
              <span className="text-offwhite">Keyd</span>
              <span className="text-teal">Tech</span>
            </Link>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-300 lg:hidden"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-8 space-y-1">
            {nav.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-teal/15 text-teal"
                      : "text-slate-300 hover:bg-white/5 hover:text-offwhite",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="mt-8 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-offwhite"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </aside>

        {open ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            aria-label="Close overlay"
            onClick={() => setOpen(false)}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#0c121e]/90 px-4 py-3 backdrop-blur-xl sm:px-6">
            <button
              type="button"
              className="rounded-xl border border-white/10 p-2 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="ml-auto text-right">
              <p className="text-sm font-semibold text-offwhite">{userName}</p>
              <p className="text-xs text-slate-400">{userRole.replace("_", " ")}</p>
            </div>
          </header>
          <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
