"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/ops/components/AdminShell";
import { AuthGate } from "@/ops/components/AuthGate";
import { StatCard } from "@/ops/components/StatCard";
import { fetchPayments, fetchTenants } from "@/ops/lib/api";

type DashboardStats = {
  totalTenants: number;
  pendingTenants: number;
  pendingPayments: number;
  subscribedTenants: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [tenants, pendingPayments] = await Promise.all([
          fetchTenants(),
          fetchPayments("PENDING"),
        ]);

        setStats({
          totalTenants: tenants.length,
          pendingTenants: tenants.filter((t) => t.status === "PENDING_APPROVAL")
            .length,
          pendingPayments: pendingPayments.length,
          subscribedTenants: tenants.filter((t) => t.status === "SUBSCRIBED")
            .length,
        });
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <AuthGate>
      <AdminShell
        title="Dashboard"
        description="Overview of tenant onboarding and payment claims"
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0A2540] border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : stats ? (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total tenants"
                value={stats.totalTenants}
                href="/ops/tenants"
                hint="All shops"
              />
              <StatCard
                label="Pending approval"
                value={stats.pendingTenants}
                accent
                href="/ops/tenants?status=PENDING_APPROVAL"
                hint="Awaiting review"
              />
              <StatCard
                label="Pending payments"
                value={stats.pendingPayments}
                accent
                href="/ops/payments?status=PENDING"
                hint="Mobile money claims"
              />
              <StatCard
                label="Subscribed"
                value={stats.subscribedTenants}
                href="/ops/tenants?status=SUBSCRIBED"
                hint="Active subscriptions"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/ops/tenants"
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#00D4B2]/40 hover:shadow-lg hover:shadow-[#00D4B2]/10"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00D4B2] to-transparent" />
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-[#0A2540]">
                    Review tenants
                  </div>
                  <span className="text-sm text-[#00D4B2] opacity-0 transition group-hover:opacity-100">
                    Open →
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Approve new shop registrations waiting for platform review.
                </p>
              </Link>
              <Link
                href="/ops/payments"
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#00D4B2]/40 hover:shadow-lg hover:shadow-[#00D4B2]/10"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00D4B2] to-transparent" />
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-[#0A2540]">
                    Review payments
                  </div>
                  <span className="text-sm text-[#00D4B2] opacity-0 transition group-hover:opacity-100">
                    Open →
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Confirm or reject mobile-money subscription payment claims.
                </p>
              </Link>
            </div>
          </div>
        ) : null}
      </AdminShell>
    </AuthGate>
  );
}
