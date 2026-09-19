/** Calendar date from an ISO instant using UTC parts (avoids +1 day in UTC+ locales). */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function formatMoney(amount: string, currency: string): string {
  const num = Number(amount);
  if (Number.isNaN(num)) return `${amount} ${currency}`;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatPlan(plan: string): string {
  const map: Record<string, string> = {
    MONTHS_1: "1 month",
    MONTHS_3: "3 months",
    MONTHS_6: "6 months",
    MONTHS_12: "12 months",
  };
  return map[plan] ?? plan.replace(/_/g, " ").toLowerCase();
}

export function formatStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
