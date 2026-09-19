"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminShell } from "@/ops/components/AdminShell";
import { AuthGate } from "@/ops/components/AuthGate";
import { DataTable } from "@/ops/components/DataTable";
import { StatusBadge } from "@/ops/components/StatusBadge";
import {
  ApiError,
  approveTenant,
  deleteTenant,
  fetchTenants,
  rejectTenant,
  type Tenant,
} from "@/ops/lib/api";
import { formatDate } from "@/ops/lib/format";
import { ModalBtn, OpsModal } from "@/ops/components/OpsModal";

const STATUS_FILTERS = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING_APPROVAL" },
  { label: "Trial", value: "TRIAL_ACTIVE" },
  { label: "Subscribed", value: "SUBSCRIBED" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "Locked", value: "LOCKED" },
] as const;

export default function TenantsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0A2540] border-t-transparent" />
        </div>
      }
    >
      <TenantsPageInner />
    </Suspense>
  );
}

function TenantsPageInner() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") ?? "ALL";
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [modal, setModal] = useState<"reject" | "delete" | null>(null);
  const [modalTenant, setModalTenant] = useState<Tenant | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const loadTenants = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchTenants();
      setTenants(data);
    } catch {
      setError("Failed to load tenants.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const filtered = useMemo(() => {
    if (statusParam === "ALL") return tenants;
    return tenants.filter((t) => t.status === statusParam);
  }, [tenants, statusParam]);

  async function handleApprove(id: string) {
    setActionId(id);
    setError(null);
    try {
      await approveTenant(id);
      await loadTenants();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to approve tenant.");
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(tenant: Tenant) {
    setModalTenant(tenant);
    setNotes("");
    setModal("reject");
  }

  async function submitReject() {
    if (!modalTenant) return;
    setBusy(true);
    setActionId(modalTenant.id);
    setError(null);
    try {
      await rejectTenant(modalTenant.id, notes.trim() || undefined);
      setModal(null);
      setModalTenant(null);
      await loadTenants();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reject tenant.");
    } finally {
      setActionId(null);
      setBusy(false);
    }
  }

  async function handleDelete(tenant: Tenant) {
    setModalTenant(tenant);
    setModal("delete");
  }

  async function submitDelete() {
    if (!modalTenant) return;
    setBusy(true);
    setActionId(modalTenant.id);
    setError(null);
    try {
      await deleteTenant(modalTenant.id);
      setModal(null);
      setModalTenant(null);
      await loadTenants();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete tenant.");
    } finally {
      setActionId(null);
      setBusy(false);
    }
  }

  const ownerEmail = (tenant: Tenant) => tenant.users[0]?.email ?? "—";

  return (
    <AuthGate>
      <AdminShell
        title="Tenants"
        description="All registered shops on the Keyd platform"
      >
        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mb-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => {
            const active = statusParam === f.value;
            const href =
              f.value === "ALL" ? "/ops/tenants" : `/ops/tenants?status=${f.value}`;
            return (
              <Link
                key={f.value}
                href={href}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-[#0A2540] text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-[#00D4B2]/50"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0A2540] border-t-transparent" />
          </div>
        ) : (
          <DataTable
            data={filtered}
            keyExtractor={(row) => row.id}
            emptyMessage="No tenants registered yet."
            columns={[
              {
                key: "name",
                header: "Shop",
                render: (row) => (
                  <div>
                    <Link
                      href={`/ops/tenants/${row.id}`}
                      className="font-medium text-[#0A2540] hover:text-[#00D4B2]"
                    >
                      {row.name}
                    </Link>
                    <div className="text-xs text-slate-500">{row.slug}</div>
                  </div>
                ),
              },
              {
                key: "owner",
                header: "Owner",
                render: (row) => ownerEmail(row),
              },
              {
                key: "category",
                header: "Category",
                render: (row) => row.businessCategory ?? "—",
              },
              {
                key: "location",
                header: "Location",
                render: (row) =>
                  row.region
                    ? `${row.district ?? "—"}, ${row.region}`
                    : (row.address ?? "—"),
              },
              {
                key: "phone",
                header: "Phone",
                render: (row) => row.phone ?? "—",
              },
              {
                key: "status",
                header: "Status",
                render: (row) => <StatusBadge status={row.status} />,
              },
              {
                key: "created",
                header: "Registered",
                render: (row) => formatDate(row.createdAt),
              },
              {
                key: "actions",
                header: "Actions",
                className: "text-right",
                render: (row) => (
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/ops/tenants/${row.id}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#0A2540] hover:bg-slate-50"
                    >
                      View
                    </Link>
                    {row.status === "PENDING_APPROVAL" ? (
                      <>
                        <button
                          type="button"
                          disabled={actionId === row.id}
                          onClick={() => handleApprove(row.id)}
                          className="rounded-lg bg-[#00D4B2] px-3 py-1.5 text-xs font-semibold text-[#0A2540] transition hover:bg-[#00D4B2]/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionId === row.id ? "…" : "Approve"}
                        </button>
                        <button
                          type="button"
                          disabled={actionId === row.id}
                          onClick={() => handleReject(row)}
                          className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </>
                    ) : null}
                    {row.status === "PENDING_APPROVAL" ||
                    row.status === "SUSPENDED" ? (
                      <button
                        type="button"
                        disabled={actionId === row.id}
                        onClick={() => handleDelete(row)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                ),
              },
            ]}
          />
        )}

        <OpsModal
          open={modal === "reject"}
          title="Reject company"
          description={modalTenant ? `Reject "${modalTenant.name}"?` : undefined}
          onClose={() => {
            if (!busy) {
              setModal(null);
              setModalTenant(null);
            }
          }}
          footer={
            <>
              <ModalBtn
                variant="secondary"
                disabled={busy}
                onClick={() => {
                  setModal(null);
                  setModalTenant(null);
                }}
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

        <OpsModal
          open={modal === "delete"}
          title="Delete company?"
          description={
            modalTenant
              ? `Permanently delete "${modalTenant.name}"? This cannot be undone.`
              : undefined
          }
          onClose={() => {
            if (!busy) {
              setModal(null);
              setModalTenant(null);
            }
          }}
          footer={
            <>
              <ModalBtn
                variant="secondary"
                disabled={busy}
                onClick={() => {
                  setModal(null);
                  setModalTenant(null);
                }}
              >
                Cancel
              </ModalBtn>
              <ModalBtn variant="danger" onClick={submitDelete} disabled={busy}>
                {busy ? "Deleting…" : "Delete forever"}
              </ModalBtn>
            </>
          }
        >
          <p className="text-sm text-slate-600">
            Only pending or rejected companies can be deleted.
          </p>
        </OpsModal>
      </AdminShell>
    </AuthGate>
  );
}
