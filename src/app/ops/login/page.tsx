"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, login } from "@/ops/lib/api";
import { isAuthenticated, setAuth } from "@/ops/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/ops/dashboard");
    }
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(email.trim(), password);
      setAuth(result.accessToken, result.user);
      router.replace("/ops/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to sign in. Check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0f3d5c_0%,_#0A2540_45%,_#061526_100%)]" />
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#00D4B2]/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/20 shadow-lg shadow-black/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ops/brand/keydtech-mark.png"
              alt="KeydTech"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-white">
            KeydTech Ops
          </div>
          <p className="mt-2 text-sm text-white/65">
            Sign in to manage tenants and payment claims
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/95 p-8 shadow-2xl shadow-black/30 backdrop-blur"
        >
          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-[#00D4B2] transition focus:border-[#00D4B2] focus:bg-white focus:ring-2"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-[#00D4B2] transition focus:border-[#00D4B2] focus:bg-white focus:ring-2"
              />
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-[#0A2540] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d2f4d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
