"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/ops/components/AdminShell";
import { AuthGate } from "@/ops/components/AuthGate";
import { ModalBtn, OpsModal } from "@/ops/components/OpsModal";
import { StatusBadge } from "@/ops/components/StatusBadge";
import {
  APP_KEYS,
  ApiError,
  approveTenant,
  confirmPayment,
  createTenantUser,
  deleteTenant,
  deleteTenantUser,
  fetchTenant,
  lockTenant,
  recordTenantPayment,
  rejectPayment,
  rejectTenant,
  setTenantPassword,
  unlockTenant,
  updateTenantSubscription,
  updateTenantUser,
  type SubscriptionPlan,
  type Tenant,
  type TenantRole,
  type TenantUser,
} from "@/ops/lib/api";
import { formatDate } from "@/ops/lib/format";
import { toast } from "sonner";

const PLANS: SubscriptionPlan[] = [
  "MONTHS_1",
  "MONTHS_3",
  "MONTHS_6",
  "MONTHS_12",
];

const ROLES: TenantRole[] = [
  "MANAGER",
  "CASHIER",
  "ACCOUNTANT",
  "INVENTORY",
];

/** Default app access when a role is selected (can still be toggled). */
const ROLE_DEFAULT_APPS: Record<Exclude<TenantRole, "OWNER">, string[]> = {
  MANAGER: [
    "dashboard",
    "sales",
    "purchase",
    "accounting",
    "expense",
    "inventory",
    "contacts",
    "payments",
    "transfers",
    "settings",
    "billing",
  ],
  CASHIER: ["sales", "purchase", "inventory", "contacts", "payments"],
  ACCOUNTANT: [
    "dashboard",
    "accounting",
    "expense",
    "payments",
    "transfers",
    "contacts",
    "billing",
  ],
  INVENTORY: ["inventory", "purchase", "contacts", "transfers"],
};

function appsForRole(role: TenantRole): string[] {
  if (role === "OWNER") return [...APP_KEYS];
  return [...(ROLE_DEFAULT_APPS[role] ?? [])];
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#00D4B2] to-[#0A2540]/40" />
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className="mt-1.5 break-words text-sm font-semibold text-[#0A2540]">
        {value}
      </div>
    </div>
  );
}

function toDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function inputClass() {
  return "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#0A2540] outline-none ring-[#00D4B2]/40 focus:ring-2";
}

type ModalKind =
  | null
  | "reject"
  | "delete"
  | "lock"
  | "unlock"
  | "password"
  | "recordPayment"
  | "rejectClaim"
  | "inviteUser"
  | "editUser"
  | "deleteUser"
  | "editSubscription"
  | "passwordDone";

export default function TenantDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
  const [notes, setNotes] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordTarget, setPasswordTarget] = useState<{
    id?: string;
    label: string;
  } | null>(null);
  const [passwordResult, setPasswordResult] = useState<string | null>(null);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [userTarget, setUserTarget] = useState<TenantUser | null>(null);

  const [payPlan, setPayPlan] = useState<SubscriptionPlan>("MONTHS_3");
  const [payRef, setPayRef] = useState("");
  const [payProvider, setPayProvider] = useState("EVC");
  const [payPhone, setPayPhone] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [payCoversUntil, setPayCoversUntil] = useState("");
  const [editCoversUntil, setEditCoversUntil] = useState("");
  const [editPlan, setEditPlan] = useState<SubscriptionPlan>("MONTHS_3");
  const [editClaimId, setEditClaimId] = useState<string | null>(null);

  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteRole, setInviteRole] = useState<TenantRole>("CASHIER");
  const [inviteApps, setInviteApps] = useState<string[]>([]);

  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<TenantRole>("CASHIER");
  const [editActive, setEditActive] = useState(true);
  const [editApps, setEditApps] = useState<string[]>([]);
  const [editPassword, setEditPassword] = useState("");

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchTenant(id);
      setTenant(data);
    } catch {
      setError("Failed to load tenant.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function closeModal() {
    if (busy) return;
    setModal(null);
    setModalError(null);
    setNotes("");
    setPassword("");
    setPasswordConfirm("");
    setPasswordTarget(null);
    setClaimId(null);
    setUserTarget(null);
    setPayRef("");
    setPayNotes("");
    setPayPhone("");
  }

  async function handleApprove() {
    if (!tenant) return;
    setBusy(true);
    setError(null);
    try {
      await approveTenant(tenant.id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Approve failed.");
    } finally {
      setBusy(false);
    }
  }

  async function submitReject() {
    if (!tenant) return;
    setBusy(true);
    setError(null);
    try {
      await rejectTenant(tenant.id, notes.trim() || undefined);
      closeModal();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Reject failed.");
    } finally {
      setBusy(false);
    }
  }

  async function submitDelete() {
    if (!tenant) return;
    setBusy(true);
    setError(null);
    try {
      await deleteTenant(tenant.id);
      router.push("/ops/tenants");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed.");
      setBusy(false);
    }
  }

  async function submitLock() {
    if (!tenant) return;
    setBusy(true);
    setError(null);
    try {
      await lockTenant(tenant.id, notes.trim() || undefined);
      closeModal();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lock failed.");
    } finally {
      setBusy(false);
    }
  }

  async function submitUnlock() {
    if (!tenant) return;
    setBusy(true);
    setError(null);
    try {
      await unlockTenant(tenant.id, notes.trim() || undefined);
      closeModal();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unlock failed.");
    } finally {
      setBusy(false);
    }
  }

  async function submitPassword() {
    if (!tenant || !passwordTarget) return;
    if (password.trim().length < 8) {
      setModalError("Password must be at least 8 characters.");
      return;
    }
    if (password !== passwordConfirm) {
      setModalError("Passwords do not match.");
      return;
    }
    setBusy(true);
    setModalError(null);
    setError(null);
    try {
      const res = await setTenantPassword(
        tenant.id,
        password.trim(),
        passwordTarget.id,
      );
      setPasswordResult(res.temporaryPassword);
      setModal("passwordDone");
      setPassword("");
      setPasswordConfirm("");
      toast.success(`Password updated for ${res.username || res.email}`);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Password update failed.";
      setModalError(msg);
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function submitRecordPayment() {
    if (!tenant) return;
    if (payRef.trim().length < 2) {
      setModalError("Enter a payment reference.");
      return;
    }
    setBusy(true);
    setModalError(null);
    setError(null);
    try {
      await recordTenantPayment(tenant.id, {
        plan: payPlan,
        reference: payRef.trim(),
        provider: payProvider,
        payerPhone: payPhone.trim() || undefined,
        notes: payNotes.trim() || undefined,
        coversUntil: payCoversUntil.trim() || undefined,
      });
      closeModal();
      await load();
      toast.success("Payment recorded — subscription active");
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not record payment.";
      setModalError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function submitEditSubscription() {
    if (!tenant) return;
    if (!editCoversUntil.trim()) {
      setModalError("Pick the last day of access (locks after that day).");
      return;
    }
    setBusy(true);
    setModalError(null);
    setError(null);
    try {
      await updateTenantSubscription(tenant.id, {
        plan: editPlan,
        coversUntil: editCoversUntil.trim(),
        claimId: editClaimId ?? undefined,
      });
      closeModal();
      await load();
      toast.success("Plan / expiry updated", {
        description: `Access until ${editCoversUntil} — locks after that day.`,
      });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not update subscription.";
      setModalError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  function openEditSubscription(claimId?: string, claimPlan?: SubscriptionPlan, claimUntil?: string | null) {
    if (!tenant) return;
    setEditClaimId(claimId ?? null);
    setEditPlan(
      claimPlan ??
        tenant.currentPlan ??
        tenant.requestedPlan ??
        "MONTHS_3",
    );
    setEditCoversUntil(
      toDateInput(claimUntil) ||
        toDateInput(tenant.subscribedUntil) ||
        "",
    );
    setModalError(null);
    setModal("editSubscription");
  }

  function claimExpires(c: {
    coversUntil?: string | null;
    status: string;
  }): string | null {
    if (c.coversUntil) return c.coversUntil;
    if (c.status === "CONFIRMED" && tenant?.subscribedUntil) {
      return tenant.subscribedUntil;
    }
    return null;
  }

  async function submitConfirmClaim(idClaim: string) {
    setBusy(true);
    setError(null);
    try {
      await confirmPayment(idClaim);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Confirm failed.");
    } finally {
      setBusy(false);
    }
  }

  async function submitRejectClaim() {
    if (!claimId) return;
    setBusy(true);
    setError(null);
    try {
      await rejectPayment(claimId, notes.trim() || undefined);
      closeModal();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Reject failed.");
    } finally {
      setBusy(false);
    }
  }

  function openInvite() {
    setInviteUsername("");
    setInviteName("");
    setInviteEmail("");
    setInvitePassword("");
    setInviteRole("CASHIER");
    setInviteApps(appsForRole("CASHIER"));
    setModalError(null);
    setModal("inviteUser");
  }

  function openEdit(u: TenantUser) {
    setUserTarget(u);
    setEditName(u.name);
    setEditRole(
      (u.role as TenantRole) === "OWNER"
        ? "MANAGER"
        : (u.role as TenantRole),
    );
    setEditActive(u.isActive !== false);
    setEditApps(
      u.role === "OWNER"
        ? [...APP_KEYS]
        : (u.allowedApps?.length
            ? u.allowedApps
            : appsForRole(u.role as TenantRole)),
    );
    setEditPassword("");
    setModalError(null);
    setModal("editUser");
  }

  function toggleApp(list: string[], key: string, setter: (v: string[]) => void) {
    setter(
      list.includes(key) ? list.filter((a) => a !== key) : [...list, key],
    );
  }

  function applyInviteRole(role: TenantRole) {
    setInviteRole(role);
    setInviteApps(appsForRole(role));
  }

  function applyEditRole(role: TenantRole) {
    setEditRole(role);
    setEditApps(appsForRole(role));
  }

  async function submitInvite() {
    if (!tenant) return;
    const username = inviteUsername.trim().toLowerCase();
    const name = inviteName.trim();
    if (!username || !name) {
      setModalError("Username and full name are required.");
      return;
    }
    if (!/^[a-z][a-z0-9_]{2,31}$/.test(username)) {
      setModalError(
        "Username must be 3–32 characters, start with a letter, and use only letters, numbers, or _.",
      );
      return;
    }
    if (invitePassword.trim().length < 8) {
      setModalError("Password must be at least 8 characters.");
      return;
    }
    if (inviteApps.length === 0) {
      setModalError("Select at least one app for access.");
      return;
    }
    setBusy(true);
    setModalError(null);
    setError(null);
    try {
      const created = await createTenantUser(tenant.id, {
        username,
        name,
        password: invitePassword.trim(),
        role: inviteRole,
        email: inviteEmail.trim() || undefined,
        allowedApps: inviteApps,
      });
      closeModal();
      await load();
      toast.success(`User created: ${created.username || username}`, {
        description: `They can log into the Keyd app with this username and the password you set. Role: ${created.role}.`,
        duration: 8000,
      });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not add user.";
      setModalError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function submitEditUser() {
    if (!tenant || !userTarget) return;
    if (userTarget.role !== "OWNER" && editApps.length === 0) {
      setModalError("Select at least one app, or deactivate the user.");
      return;
    }
    setBusy(true);
    setModalError(null);
    setError(null);
    try {
      const isOwner = userTarget.role === "OWNER";
      const updated = await updateTenantUser(tenant.id, userTarget.id, {
        name: editName.trim() || undefined,
        role: isOwner ? undefined : editRole,
        isActive: isOwner ? undefined : editActive,
        allowedApps: isOwner ? undefined : editApps,
        password:
          editPassword.trim().length >= 8
            ? editPassword.trim()
            : undefined,
      });
      closeModal();
      await load();
      toast.success(`Access updated for ${updated.name}`, {
        description: isOwner
          ? "Owner password/name saved."
          : `Role ${updated.role} · apps: ${(updated.allowedApps ?? []).join(", ") || "none"}`,
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Update failed.";
      setModalError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function submitDeleteUser() {
    if (!tenant || !userTarget) return;
    setBusy(true);
    setModalError(null);
    setError(null);
    try {
      await deleteTenantUser(tenant.id, userTarget.id);
      const name = userTarget.name;
      closeModal();
      await load();
      toast.success(`Removed ${name}`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Delete failed.";
      setModalError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthGate>
      <AdminShell
        title={tenant?.name ?? "Tenant"}
        description="Company detail — users, access, lock & payments"
      >
        <div className="mb-4">
          <Link
            href="/ops/tenants"
            className="text-sm font-medium text-[#00D4B2] hover:underline"
          >
            ← Back to tenants
          </Link>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading || !tenant ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0A2540] border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <StatusBadge status={tenant.status} />
              {tenant.status === "PENDING_APPROVAL" ? (
                <>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleApprove}
                    className="rounded-lg bg-[#00D4B2] px-3 py-2 text-sm font-semibold text-[#0A2540] disabled:opacity-60 sm:px-4"
                  >
                    Approve & start trial
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setNotes("");
                      setModal("reject");
                    }}
                    className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </>
              ) : null}
              {tenant.status === "PENDING_APPROVAL" ||
              tenant.status === "SUSPENDED" ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setModal("delete")}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-60"
                >
                  Delete company
                </button>
              ) : null}
              {tenant.status === "TRIAL_ACTIVE" ||
              tenant.status === "SUBSCRIBED" ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setNotes("");
                    setModal("lock");
                  }}
                  className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800 disabled:opacity-60"
                >
                  Lock (require payment)
                </button>
              ) : null}
              {tenant.status === "LOCKED" ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setNotes("");
                    setModal("unlock");
                  }}
                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900 disabled:opacity-60"
                >
                  Unlock without payment
                </button>
              ) : null}
              {tenant.status !== "PENDING_APPROVAL" &&
              tenant.status !== "SUSPENDED" ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setPayPlan(tenant.currentPlan ?? tenant.requestedPlan ?? "MONTHS_3");
                    setPayPhone(tenant.phone ?? "");
                    setPayRef("");
                    setPayNotes("");
                    setPayProvider("EVC");
                    setPayCoversUntil(toDateInput(tenant.subscribedUntil) || "");
                    setModalError(null);
                    setModal("recordPayment");
                  }}
                  className="rounded-lg bg-[#0A2540] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Mark paid / record payment
                </button>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Shop" value={tenant.name} />
              <Field label="Slug" value={tenant.slug} />
              <Field label="Phone" value={tenant.phone ?? "—"} />
              <Field label="Company No." value={tenant.companyRegNo ?? "—"} />
              <Field label="Category" value={tenant.businessCategory ?? "—"} />
              <Field
                label="Location"
                value={
                  tenant.region
                    ? `${tenant.district ?? "—"}, ${tenant.region}`
                    : (tenant.address ?? "—")
                }
              />
              <Field label="Address detail" value={tenant.address ?? "—"} />
              <Field label="Requested plan" value={tenant.requestedPlan ?? "—"} />
              <Field label="Current plan" value={tenant.currentPlan ?? "—"} />
              <Field label="Currency" value={tenant.currency} />
              <Field label="Registered" value={formatDate(tenant.createdAt)} />
              <Field
                label="Trial"
                value={
                  tenant.trialEndsAt
                    ? `Until ${formatDate(tenant.trialEndsAt)}`
                    : "—"
                }
              />
              <Field
                label="Subscribed until"
                value={
                  tenant.subscribedUntil
                    ? formatDate(tenant.subscribedUntil)
                    : "—"
                }
              />
              <Field
                label="Approved by"
                value={tenant.approvedBy?.email ?? "—"}
              />
            </div>

            {tenant._count ? (
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Activity inside this tenant
                </h2>
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
                  <Field label="Products" value={tenant._count.products} />
                  <Field label="Partners" value={tenant._count.partners} />
                  <Field label="Sales" value={tenant._count.sales} />
                  <Field label="Purchases" value={tenant._count.purchases} />
                  <Field
                    label="Journal entries"
                    value={tenant._count.journalEntries}
                  />
                </div>
              </div>
            ) : null}

            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Users & access
                </h2>
                <button
                  type="button"
                  disabled={busy}
                  onClick={openInvite}
                  className="rounded-lg bg-[#00D4B2] px-3 py-1.5 text-xs font-semibold text-[#0A2540] disabled:opacity-60"
                >
                  + Add user
                </button>
              </div>
              <div className="space-y-3 md:hidden">
                {tenant.users.map((u) => (
                  <div
                    key={u.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-[#0A2540]">
                          {u.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {u.username || u.email}
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {u.role}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      {u.isActive === false ? "Inactive" : "Active"}
                      {u.role !== "OWNER" && (u.allowedApps?.length ?? 0) > 0
                        ? ` · ${u.allowedApps!.join(", ")}`
                        : u.role === "OWNER"
                          ? " · Full access"
                          : ""}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => openEdit(u)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#0A2540]"
                      >
                        Edit access
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setPasswordTarget({
                            id: u.id,
                            label: u.username || u.email || u.name,
                          });
                          setPassword("");
                          setPasswordConfirm("");
                          setModal("password");
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#0A2540]"
                      >
                        Set password
                      </button>
                      {u.role !== "OWNER" ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            setUserTarget(u);
                            setModal("deleteUser");
                          }}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Login</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Access</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenant.users.map((u) => (
                        <tr key={u.id} className="border-t border-slate-100">
                          <td className="px-4 py-3 font-medium text-[#0A2540]">
                            {u.name}
                            {u.isActive === false ? (
                              <span className="ml-2 text-xs text-red-600">
                                inactive
                              </span>
                            ) : null}
                          </td>
                          <td className="px-4 py-3">
                            <div>{u.username || "—"}</div>
                            <div className="text-xs text-slate-400">
                              {u.email}
                            </div>
                          </td>
                          <td className="px-4 py-3">{u.role}</td>
                          <td className="max-w-xs px-4 py-3 text-xs text-slate-600">
                            {u.role === "OWNER"
                              ? "Full access"
                              : (u.allowedApps ?? []).join(", ") || "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex flex-wrap justify-end gap-2">
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => openEdit(u)}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#0A2540] hover:bg-slate-50 disabled:opacity-60"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => {
                                  setPasswordTarget({
                                    id: u.id,
                                    label: u.username || u.email || u.name,
                                  });
                                  setPassword("");
                                  setPasswordConfirm("");
                                  setModal("password");
                                }}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#0A2540] hover:bg-slate-50 disabled:opacity-60"
                              >
                                Password
                              </button>
                              {u.role !== "OWNER" ? (
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => {
                                    setUserTarget(u);
                                    setModal("deleteUser");
                                  }}
                                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                                >
                                  Remove
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Payment claims
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tenant.status === "SUBSCRIBED" ||
                  tenant.status === "LOCKED" ||
                  tenant.status === "TRIAL_ACTIVE" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => openEditSubscription()}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#0A2540]"
                    >
                      Edit plan / expiry
                    </button>
                  ) : null}
                  {tenant.status !== "PENDING_APPROVAL" &&
                  tenant.status !== "SUSPENDED" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setPayPlan(
                          tenant.currentPlan ??
                            tenant.requestedPlan ??
                            "MONTHS_3",
                        );
                        setPayCoversUntil(
                          toDateInput(tenant.subscribedUntil) || "",
                        );
                        setPayRef("");
                        setPayNotes("");
                        setModalError(null);
                        setModal("recordPayment");
                      }}
                      className="rounded-lg border border-[#0A2540]/20 px-3 py-1.5 text-xs font-semibold text-[#0A2540]"
                    >
                      Record payment
                    </button>
                  ) : null}
                </div>
              </div>
              {!tenant.paymentClaims || tenant.paymentClaims.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
                  No payment claims yet. Use “Mark paid” when the customer pays
                  outside the app.
                </div>
              ) : (
                <>
                  <div className="space-y-3 md:hidden">
                    {tenant.paymentClaims.map((c) => {
                      const expires = claimExpires(c);
                      return (
                      <div
                        key={c.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-[#0A2540]">
                            {c.plan}
                          </div>
                          <StatusBadge status={c.status} />
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          {c.amount} {c.currency} · {c.reference}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Paid: {formatDate(c.createdAt)}
                        </div>
                        <div className="mt-0.5 text-xs font-semibold text-[#0A2540]">
                          Access until: {formatDate(expires)}
                          {expires ? " (locks after)" : ""}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                        {c.status === "PENDING" ? (
                          <>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => submitConfirmClaim(c.id)}
                              className="rounded-lg bg-[#00D4B2] px-3 py-1.5 text-xs font-semibold text-[#0A2540]"
                            >
                              Confirm paid
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => {
                                setClaimId(c.id);
                                setNotes("");
                                setModal("rejectClaim");
                              }}
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                            >
                              Reject
                            </button>
                          </>
                        ) : null}
                        {c.status === "CONFIRMED" ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              openEditSubscription(
                                c.id,
                                c.plan,
                                expires,
                              )
                            }
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#0A2540]"
                          >
                            Edit expiry
                          </button>
                        ) : null}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                  <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Plan</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Reference</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Paid</th>
                            <th className="px-4 py-3">Access until</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tenant.paymentClaims.map((c) => {
                            const expires = claimExpires(c);
                            return (
                            <tr
                              key={c.id}
                              className="border-t border-slate-100"
                            >
                              <td className="px-4 py-3">{c.plan}</td>
                              <td className="px-4 py-3">
                                {c.amount} {c.currency}
                              </td>
                              <td className="px-4 py-3">{c.reference}</td>
                              <td className="px-4 py-3">
                                <StatusBadge status={c.status} />
                              </td>
                              <td className="px-4 py-3">
                                {formatDate(c.createdAt)}
                              </td>
                              <td className="px-4 py-3 font-semibold text-[#0A2540]">
                                {formatDate(expires)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {c.status === "PENDING" ? (
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      disabled={busy}
                                      onClick={() => submitConfirmClaim(c.id)}
                                      className="rounded-lg bg-[#00D4B2] px-3 py-1.5 text-xs font-semibold text-[#0A2540]"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      type="button"
                                      disabled={busy}
                                      onClick={() => {
                                        setClaimId(c.id);
                                        setNotes("");
                                        setModal("rejectClaim");
                                      }}
                                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : c.status === "CONFIRMED" ? (
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() =>
                                      openEditSubscription(
                                        c.id,
                                        c.plan,
                                        expires,
                                      )
                                    }
                                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#0A2540] hover:bg-slate-50"
                                  >
                                    Edit
                                  </button>
                                ) : (
                                  "—"
                                )}
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Reject tenant */}
        <OpsModal
          open={modal === "reject"}
          title="Reject company"
          description="They will be marked suspended and cannot use the app."
          onClose={closeModal}
          footer={
            <>
              <ModalBtn variant="secondary" onClick={closeModal} disabled={busy}>
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
              className={inputClass()}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </OpsModal>

        <OpsModal
          open={modal === "delete"}
          title="Delete company?"
          description={`Permanently delete "${tenant?.name ?? ""}" and all its data. This cannot be undone.`}
          onClose={closeModal}
          footer={
            <>
              <ModalBtn variant="secondary" onClick={closeModal} disabled={busy}>
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

        <OpsModal
          open={modal === "lock"}
          title="Lock company"
          description="The shop app will be blocked until payment is confirmed or you unlock them."
          onClose={closeModal}
          footer={
            <>
              <ModalBtn variant="secondary" onClick={closeModal} disabled={busy}>
                Cancel
              </ModalBtn>
              <ModalBtn onClick={submitLock} disabled={busy}>
                {busy ? "Locking…" : "Lock now"}
              </ModalBtn>
            </>
          }
        >
          <label className="block text-sm font-medium text-slate-700">
            Notes (optional)
            <textarea
              className={inputClass()}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Trial ended early — waiting for payment"
            />
          </label>
        </OpsModal>

        <OpsModal
          open={modal === "unlock"}
          title="Unlock without payment"
          description="Reopen access using their remaining trial or subscription period."
          onClose={closeModal}
          footer={
            <>
              <ModalBtn variant="secondary" onClick={closeModal} disabled={busy}>
                Cancel
              </ModalBtn>
              <ModalBtn onClick={submitUnlock} disabled={busy}>
                {busy ? "Unlocking…" : "Unlock"}
              </ModalBtn>
            </>
          }
        >
          <label className="block text-sm font-medium text-slate-700">
            Notes (optional)
            <textarea
              className={inputClass()}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </OpsModal>

        <OpsModal
          open={modal === "password"}
          title="Set password"
          description={`New password for ${passwordTarget?.label ?? "user"} (min 8 characters).`}
          onClose={closeModal}
          footer={
            <>
              <ModalBtn variant="secondary" onClick={closeModal} disabled={busy}>
                Cancel
              </ModalBtn>
              <ModalBtn onClick={submitPassword} disabled={busy}>
                {busy ? "Saving…" : "Save password"}
              </ModalBtn>
            </>
          }
        >
          <div className="space-y-3">
            {modalError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {modalError}
              </div>
            ) : null}
            <label className="block text-sm font-medium text-slate-700">
              New password
              <input
                type="password"
                autoComplete="new-password"
                className={inputClass()}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Confirm password
              <input
                type="password"
                autoComplete="new-password"
                className={inputClass()}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </label>
          </div>
        </OpsModal>

        <OpsModal
          open={modal === "passwordDone"}
          title="Password updated"
          description="Copy this password now — it won’t be shown again."
          onClose={() => {
            setPasswordResult(null);
            closeModal();
          }}
          footer={
            <>
              <ModalBtn
                variant="secondary"
                onClick={async () => {
                  if (passwordResult) {
                    try {
                      await navigator.clipboard.writeText(passwordResult);
                    } catch {
                      /* ignore */
                    }
                  }
                }}
              >
                Copy
              </ModalBtn>
              <ModalBtn
                onClick={() => {
                  setPasswordResult(null);
                  closeModal();
                }}
              >
                Done
              </ModalBtn>
            </>
          }
        >
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-mono text-sm text-emerald-900">
            {passwordResult}
          </div>
        </OpsModal>

        <OpsModal
          open={modal === "recordPayment"}
          title="Mark paid / record payment"
          description="Creates a confirmed payment and sets status to Subscribed."
          onClose={closeModal}
          wide
          footer={
            <>
              <ModalBtn variant="secondary" onClick={closeModal} disabled={busy}>
                Cancel
              </ModalBtn>
              <ModalBtn onClick={submitRecordPayment} disabled={busy}>
                {busy ? "Saving…" : "Confirm & activate"}
              </ModalBtn>
            </>
          }
        >
          <div className="space-y-3">
            {modalError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {modalError}
              </div>
            ) : null}
            <label className="block text-sm font-medium text-slate-700">
              Plan
              <select
                className={inputClass()}
                value={payPlan}
                onChange={(e) =>
                  setPayPlan(e.target.value as SubscriptionPlan)
                }
              >
                {PLANS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Provider
              <select
                className={inputClass()}
                value={payProvider}
                onChange={(e) => setPayProvider(e.target.value)}
              >
                <option value="EVC">EVC</option>
                <option value="ZAAD">ZAAD</option>
                <option value="SAHAL">SAHAL</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Payment reference *
              <input
                className={inputClass()}
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="e.g. EVC-12345"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Access until (locks after this day)
              <input
                type="date"
                className={inputClass()}
                value={payCoversUntil}
                onChange={(e) => setPayCoversUntil(e.target.value)}
              />
              <span className="mt-1 block text-xs font-normal text-slate-400">
                Optional — leave empty to auto-extend by the plan length.
              </span>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Payer phone
              <input
                className={inputClass()}
                value={payPhone}
                onChange={(e) => setPayPhone(e.target.value)}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Notes
              <textarea
                className={inputClass()}
                rows={2}
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
              />
            </label>
          </div>
        </OpsModal>

        <OpsModal
          open={modal === "editSubscription"}
          title="Edit plan / expiry"
          description="Change the plan and the last day they can use the app. They lock automatically after that day."
          onClose={closeModal}
          wide
          footer={
            <>
              <ModalBtn variant="secondary" onClick={closeModal} disabled={busy}>
                Cancel
              </ModalBtn>
              <ModalBtn onClick={submitEditSubscription} disabled={busy}>
                {busy ? "Saving…" : "Save"}
              </ModalBtn>
            </>
          }
        >
          <div className="space-y-3">
            {modalError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {modalError}
              </div>
            ) : null}
            <label className="block text-sm font-medium text-slate-700">
              Plan
              <select
                className={inputClass()}
                value={editPlan}
                onChange={(e) =>
                  setEditPlan(e.target.value as SubscriptionPlan)
                }
              >
                {PLANS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Access until *
              <input
                type="date"
                className={inputClass()}
                value={editCoversUntil}
                onChange={(e) => setEditCoversUntil(e.target.value)}
              />
              <span className="mt-1 block text-xs font-normal text-slate-400">
                Example: pay today Sep 15 → set Oct 10. App locks after Oct 10
                ends (no grace).
              </span>
            </label>
          </div>
        </OpsModal>

        <OpsModal
          open={modal === "rejectClaim"}
          title="Reject payment claim"
          onClose={closeModal}
          footer={
            <>
              <ModalBtn variant="secondary" onClick={closeModal} disabled={busy}>
                Cancel
              </ModalBtn>
              <ModalBtn onClick={submitRejectClaim} disabled={busy}>
                {busy ? "Rejecting…" : "Reject claim"}
              </ModalBtn>
            </>
          }
        >
          <label className="block text-sm font-medium text-slate-700">
            Notes (optional)
            <textarea
              className={inputClass()}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </OpsModal>

        <OpsModal
          open={modal === "inviteUser"}
          title="Add company user"
          description="Create a login and choose which apps they can open."
          onClose={closeModal}
          wide
          footer={
            <>
              <ModalBtn variant="secondary" onClick={closeModal} disabled={busy}>
                Cancel
              </ModalBtn>
              <ModalBtn onClick={submitInvite} disabled={busy}>
                {busy ? "Creating…" : "Create user"}
              </ModalBtn>
            </>
          }
        >
          <div className="space-y-3">
            {modalError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {modalError}
              </div>
            ) : null}
            <label className="block text-sm font-medium text-slate-700">
              Username * (app login)
              <input
                className={inputClass()}
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                placeholder="cashier1"
                autoComplete="off"
              />
              <span className="mt-1 block text-xs font-normal text-slate-400">
                Letters, numbers, underscore — starts with a letter
              </span>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Full name *
              <input
                className={inputClass()}
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Email (optional)
              <input
                className={inputClass()}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Temporary password *
              <input
                type="password"
                className={inputClass()}
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Role
              <select
                className={inputClass()}
                value={inviteRole}
                onChange={(e) =>
                  applyInviteRole(e.target.value as TenantRole)
                }
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs font-normal text-slate-400">
                Changing role resets app access to that role’s defaults — you
                can still tick/untick apps.
              </span>
            </label>
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium text-slate-700">
                  App access
                </div>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#00D4B2] hover:underline"
                  onClick={() => setInviteApps(appsForRole(inviteRole))}
                >
                  Reset to role defaults
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {APP_KEYS.map((key) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 rounded-lg border border-slate-100 px-2 py-1.5 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={inviteApps.includes(key)}
                      onChange={() =>
                        toggleApp(inviteApps, key, setInviteApps)
                      }
                    />
                    {key}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </OpsModal>

        <OpsModal
          open={modal === "editUser"}
          title={
            userTarget?.role === "OWNER"
              ? "Edit owner"
              : `Edit access — ${userTarget?.name ?? ""}`
          }
          onClose={closeModal}
          wide
          footer={
            <>
              <ModalBtn variant="secondary" onClick={closeModal} disabled={busy}>
                Cancel
              </ModalBtn>
              <ModalBtn onClick={submitEditUser} disabled={busy}>
                {busy ? "Saving…" : "Save"}
              </ModalBtn>
            </>
          }
        >
          <div className="space-y-3">
            {modalError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {modalError}
              </div>
            ) : null}
            <label className="block text-sm font-medium text-slate-700">
              Name
              <input
                className={inputClass()}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </label>
            {userTarget?.role !== "OWNER" ? (
              <>
                <label className="block text-sm font-medium text-slate-700">
                  Role
                  <select
                    className={inputClass()}
                    value={editRole}
                    onChange={(e) =>
                      applyEditRole(e.target.value as TenantRole)
                    }
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block text-xs font-normal text-slate-400">
                    Changing role resets apps to that role’s defaults.
                  </span>
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                  />
                  Active (can log in)
                </label>
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium text-slate-700">
                      App access
                    </div>
                    <button
                      type="button"
                      className="text-xs font-semibold text-[#00D4B2] hover:underline"
                      onClick={() => setEditApps(appsForRole(editRole))}
                    >
                      Reset to role defaults
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {APP_KEYS.map((key) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 rounded-lg border border-slate-100 px-2 py-1.5 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={editApps.includes(key)}
                          onChange={() =>
                            toggleApp(editApps, key, setEditApps)
                          }
                        />
                        {key}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                Owner always has full app access. Use Set password to reset
                login.
              </p>
            )}
            <label className="block text-sm font-medium text-slate-700">
              New password (optional)
              <input
                type="password"
                className={inputClass()}
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Leave blank to keep current"
              />
            </label>
          </div>
        </OpsModal>

        <OpsModal
          open={modal === "deleteUser"}
          title="Remove user?"
          description={`Remove ${userTarget?.name ?? "this user"} from the company.`}
          onClose={closeModal}
          footer={
            <>
              <ModalBtn variant="secondary" onClick={closeModal} disabled={busy}>
                Cancel
              </ModalBtn>
              <ModalBtn variant="danger" onClick={submitDeleteUser} disabled={busy}>
                {busy ? "Removing…" : "Remove"}
              </ModalBtn>
            </>
          }
        >
          <p className="text-sm text-slate-600">This cannot be undone.</p>
        </OpsModal>
      </AdminShell>
    </AuthGate>
  );
}
