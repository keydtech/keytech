import { getOpsApiUrl } from "./config";
import { clearAuth, getToken } from "./auth";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type TenantStatus =
  | "PENDING_APPROVAL"
  | "TRIAL_ACTIVE"
  | "LOCKED"
  | "SUBSCRIBED"
  | "SUSPENDED";

export type PaymentClaimStatus = "PENDING" | "CONFIRMED" | "REJECTED";

export type SubscriptionPlan = "MONTHS_1" | "MONTHS_3" | "MONTHS_6" | "MONTHS_12";

export type TenantUser = {
  id: string;
  email: string;
  username?: string | null;
  name: string;
  phone: string | null;
  role: string;
  isActive?: boolean;
  allowedApps?: string[];
  createdAt?: string;
};

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  businessCategory?: string | null;
  region?: string | null;
  district?: string | null;
  companyRegNo?: string | null;
  requestedPlan?: SubscriptionPlan | null;
  currency: string;
  status: TenantStatus;
  trialStartsAt: string | null;
  trialEndsAt: string | null;
  subscribedUntil: string | null;
  currentPlan: SubscriptionPlan | null;
  createdAt: string;
  users: TenantUser[];
  paymentClaims?: PaymentClaim[];
  approvedBy?: { id: string; name: string; email: string } | null;
  _count?: {
    products: number;
    partners: number;
    sales: number;
    purchases: number;
    journalEntries: number;
  };
};

export type PaymentClaim = {
  id: string;
  tenantId: string;
  plan: SubscriptionPlan;
  provider: string;
  amount: string;
  currency: string;
  reference: string;
  payerPhone: string | null;
  status: PaymentClaimStatus;
  notes: string | null;
  coversUntil?: string | null;
  createdAt: string;
  confirmedAt?: string | null;
  tenant?: {
    id: string;
    name: string;
    slug: string;
  };
};

export const APP_KEYS = [
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
] as const;

export type AppKey = (typeof APP_KEYS)[number];

export type TenantRole =
  | "OWNER"
  | "MANAGER"
  | "CASHIER"
  | "ACCOUNTANT"
  | "INVENTORY";

export type LoginResponse = {
  accessToken: string;
  user: { id: string; email: string; name: string };
};

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(data.message)) return data.message.join(", ");
    if (data.message) return data.message;
  } catch {
    /* fall through */
  }
  return res.statusText || "Request failed";
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${getOpsApiUrl()}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearAuth();
    if (typeof window !== "undefined" && !path.includes("/auth/login")) {
      window.location.href = "/ops/login";
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, await parseError(res));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export function login(email: string, password: string) {
  return apiFetch<LoginResponse>("/ops/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function fetchTenants() {
  return apiFetch<Tenant[]>("/ops/tenants");
}

export function fetchTenant(id: string) {
  return apiFetch<Tenant>(`/ops/tenants/${id}`);
}

export function approveTenant(id: string) {
  return apiFetch<Tenant>(`/ops/tenants/${id}/approve`, { method: "POST" });
}

export function rejectTenant(id: string, notes?: string) {
  return apiFetch<Tenant>(`/ops/tenants/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });
}

export function deleteTenant(id: string) {
  return apiFetch<{ ok: boolean; id: string }>(`/ops/tenants/${id}/delete`, {
    method: "POST",
  });
}

export function lockTenant(id: string, notes?: string) {
  return apiFetch<Tenant>(`/ops/tenants/${id}/lock`, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });
}

export function unlockTenant(id: string, notes?: string) {
  return apiFetch<Tenant>(`/ops/tenants/${id}/unlock`, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });
}

export function recordTenantPayment(
  id: string,
  body: {
    plan: SubscriptionPlan;
    reference: string;
    provider?: string;
    amount?: number;
    payerPhone?: string;
    notes?: string;
    coversUntil?: string;
  },
) {
  return apiFetch<{ tenant: Tenant; claim: PaymentClaim }>(
    `/ops/tenants/${id}/record-payment`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export function updateTenantSubscription(
  id: string,
  body: {
    plan?: SubscriptionPlan;
    coversUntil?: string;
    claimId?: string;
  },
) {
  return apiFetch<Tenant>(`/ops/tenants/${id}/subscription`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function setTenantPassword(
  id: string,
  password: string,
  userId?: string,
) {
  return apiFetch<{
    ok: boolean;
    userId: string;
    username: string | null;
    email: string;
    name: string;
    temporaryPassword: string;
  }>(`/ops/tenants/${id}/set-password`, {
    method: "POST",
    body: JSON.stringify({ password, userId }),
  });
}

export function createTenantUser(
  tenantId: string,
  body: {
    username: string;
    name: string;
    password: string;
    role: TenantRole;
    email?: string;
    allowedApps?: string[];
  },
) {
  return apiFetch<TenantUser>(`/ops/tenants/${tenantId}/users`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateTenantUser(
  tenantId: string,
  userId: string,
  body: {
    name?: string;
    role?: TenantRole;
    isActive?: boolean;
    allowedApps?: string[];
    password?: string;
  },
) {
  return apiFetch<TenantUser>(`/ops/tenants/${tenantId}/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteTenantUser(tenantId: string, userId: string) {
  return apiFetch<{ ok: boolean }>(
    `/ops/tenants/${tenantId}/users/${userId}`,
    { method: "DELETE" },
  );
}

export function fetchPayments(status?: PaymentClaimStatus) {
  const query = status ? `?status=${status}` : "";
  return apiFetch<PaymentClaim[]>(`/ops/payments${query}`);
}

export function confirmPayment(id: string) {
  return apiFetch(`/ops/payments/${id}/confirm`, { method: "POST" });
}

export function rejectPayment(id: string, notes?: string) {
  return apiFetch(`/ops/payments/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });
}
