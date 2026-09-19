"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminShell } from "@/ops/components/AdminShell";
import { AuthGate } from "@/ops/components/AuthGate";
import { DataTable } from "@/ops/components/DataTable";
import { StatusBadge } from "@/ops/components/StatusBadge";
import {
  ApiError,
  confirmPayment,
  fetchPayments,
  rejectPayment,
  type PaymentClaim,
  type PaymentClaimStatus,
} from "@/ops/lib/api";
import { formatDateTime, formatMoney, formatPlan } from "@/ops/lib/format";
import { ModalBtn, OpsModal } from "@/ops/components/OpsModal";

const filters: { label: string; value: PaymentClaimStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Rejected", value: "REJECTED" },
];

export default function PaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0A2540] border-t-transparent" />
        </div>
      }
    >
      <PaymentsPageInner />
    </Suspense>
  );
}

function PaymentsPageInner() {
  const searchParams = useSearchParams();
  const initial =
    (searchParams.get("status") as PaymentClaimStatus | null) ?? "ALL";
  const [payments, setPayments] = useState<PaymentClaim[]>([]);
  const [filter, setFilter] = useState<PaymentClaimStatus | "ALL">(
    initial === "PENDING" ||
      initial === "CONFIRMED" ||
      initial === "REJECTED"
      ? initial
      : "ALL",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const loadPayments = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchPayments(
        filter === "ALL" ? undefined : filter,
      );
      setPayments(data);
    } catch {
      setError("Failed to load payment claims.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    loadPayments();
  }, [loadPayments]);

  async function handleConfirm(id: string) {
    setActionId(id);
    setError(null);
    try {
      await confirmPayment(id);
      await loadPayments();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to confirm payment.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id: string) {
    setRejectId(id);
    setNotes("");
  }

  async function submitReject() {
    if (!rejectId) return;
    setBusy(true);
    setActionId(rejectId);
    setError(null);
    try {
      await rejectPayment(rejectId, notes.trim() || undefined);
      setRejectId(null);
      await loadPayments();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to reject payment.",
      );
    } finally {
      setActionId(null);
      setBusy(false);
    }
  }

  return (
    <AuthGate>
      <AdminShell
        title="Payment claims"
        description="Review mobile-money subscription payments submitted by tenants"
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filter === item.value
                  ? "bg-[#0A2540] text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0A2540] border-t-transparent" />
          </div>
        ) : (
          <DataTable
            data={payments}
            keyExtractor={(row) => row.id}
            emptyMessage="No payment claims found."
            columns={[
              {
                key: "tenant",
                header: "Tenant",
                render: (row) => (
                  <div>
                    <div className="font-medium text-[#0A2540]">
                      {row.tenant?.name ?? "—"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {row.tenant?.slug ?? ""}
                    </div>
                  </div>
                ),
              },
              {
                key: "plan",
                header: "Plan",
                render: (row) => formatPlan(row.plan),
              },
              {
                key: "amount",
                header: "Amount",
                render: (row) => formatMoney(row.amount, row.currency),
              },
              {
                key: "provider",
                header: "Provider",
                render: (row) => row.provider,
              },
              {
                key: "reference",
                header: "Reference",
                render: (row) => (
                  <span className="font-mono text-xs">{row.reference}</span>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (row) => <StatusBadge status={row.status} />,
              },
              {
                key: "submitted",
                header: "Submitted",
                render: (row) => formatDateTime(row.createdAt),
              },
              {
                key: "actions",
                header: "Actions",
                className: "text-right",
                render: (row) =>
                  row.status === "PENDING" ? (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={actionId === row.id}
                        onClick={() => handleConfirm(row.id)}
                        className="rounded-lg bg-[#00D4B2] px-3 py-1.5 text-xs font-semibold text-[#0A2540] transition hover:bg-[#00D4B2]/90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionId === row.id ? "…" : "Confirm"}
                      </button>
                      <button
                        type="button"
                        disabled={actionId === row.id}
                        onClick={() => handleReject(row.id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  ),
              },
            ]}
          />
        )}

        <OpsModal
          open={rejectId !== null}
          title="Reject payment claim"
          onClose={() => {
            if (!busy) setRejectId(null);
          }}
          footer={
            <>
              <ModalBtn
                variant="secondary"
                disabled={busy}
                onClick={() => setRejectId(null)}
              >
                Cancel
              </ModalBtn>
              <ModalBtn onClick={submitReject} disabled={busy}>
                {busy ? "Rejecting…" : "Reject"}
              </ModalBtn>
            </>
          }
        >
          <label className="block text-sm font-medium text-slate-700">
            Notes (optional)
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00D4B2]/40"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </OpsModal>
      </AdminShell>
    </AuthGate>
  );
}
