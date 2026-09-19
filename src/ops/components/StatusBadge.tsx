type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  warning: "bg-amber-50 text-amber-800 ring-amber-600/20",
  danger: "bg-red-50 text-red-700 ring-red-600/20",
  info: "bg-sky-50 text-sky-700 ring-sky-600/20",
};

const statusVariants: Record<string, BadgeVariant> = {
  PENDING_APPROVAL: "warning",
  TRIAL_ACTIVE: "info",
  SUBSCRIBED: "success",
  LOCKED: "danger",
  SUSPENDED: "danger",
  PENDING: "warning",
  CONFIRMED: "success",
  REJECTED: "danger",
};

type StatusBadgeProps = {
  status: string;
  label?: string;
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const variant = statusVariants[status] ?? "default";
  const text =
    label ??
    status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${variantStyles[variant]}`}
    >
      {text}
    </span>
  );
}
