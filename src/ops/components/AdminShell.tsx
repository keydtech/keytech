"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuth, getUser } from "@/ops/lib/auth";

const navItems = [
  { href: "/ops/dashboard", label: "Dashboard" },
  { href: "/ops/tenants", label: "Tenants" },
  { href: "/ops/payments", label: "Payments" },
];

type AdminShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function AdminShell({ title, description, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function handleLogout() {
    clearAuth();
    router.replace("/ops/login");
  }

  const sidebar = (
    <>
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ops/brand/keydtech-mark.png"
            alt="KeydTech"
            className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/15"
          />
          <div>
            <div className="text-base font-semibold tracking-tight">
              KeydTech Ops
            </div>
            <div className="mt-0.5 text-[11px] text-white/55">
              Platform administration
            </div>
          </div>
        </div>
      </div>

      <nav className="relative flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active =
            item.href === "/ops/tenants"
              ? pathname.startsWith("/ops/tenants")
              : pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#00D4B2]/15 text-[#00D4B2] ring-1 ring-[#00D4B2]/25"
                  : "text-white/75 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="relative border-t border-white/10 px-4 py-4">
        <div className="truncate text-sm font-medium">
          {user?.name ?? "Admin"}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 w-full rounded-xl border border-white/15 px-3 py-2 text-sm text-white/80 transition-colors hover:border-white/35 hover:bg-white/5 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[linear-gradient(180deg,#f4f7fb_0%,#eef3f8_100%)]">
      {/* Desktop sidebar */}
      <aside className="relative hidden w-64 shrink-0 flex-col overflow-hidden bg-[#0A2540] text-white lg:flex">
        <div className="pointer-events-none absolute -right-16 top-24 h-40 w-40 rounded-full bg-[#00D4B2]/15 blur-2xl" />
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {menuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-[#0A2540]/50"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="relative flex h-full w-[min(18rem,85vw)] flex-col overflow-hidden bg-[#0A2540] text-white shadow-2xl">
            <div className="pointer-events-none absolute -right-16 top-24 h-40 w-40 rounded-full bg-[#00D4B2]/15 blur-2xl" />
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-slate-200/80 bg-white/80 px-4 py-4 backdrop-blur sm:px-6 lg:px-8 lg:py-6">
          <div className="flex items-start gap-3">
            <button
              type="button"
              className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#0A2540] lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold tracking-tight text-[#0A2540] sm:text-2xl">
                {title}
              </h1>
              {description ? (
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              ) : null}
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
