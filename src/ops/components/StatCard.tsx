import Link from "next/link";

type StatCardProps = {
  label: string;
  value: number | string;
  hint?: string;
  accent?: boolean;
  href?: string;
};

export function StatCard({ label, value, hint, accent, href }: StatCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium text-slate-500">{label}</div>
        {href ? (
          <span className="mt-0.5 text-xs font-medium text-[#00D4B2] opacity-0 transition group-hover:opacity-100">
            Open →
          </span>
        ) : null}
      </div>
      <div
        className={`mt-3 text-3xl font-semibold tracking-tight ${
          accent ? "text-[#00D4B2]" : "text-[#0A2540]"
        }`}
      >
        {value}
      </div>
      {hint ? <div className="mt-1.5 text-xs text-slate-400">{hint}</div> : null}
    </>
  );

  const className = `group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition ${
    href
      ? "hover:-translate-y-0.5 hover:border-[#00D4B2]/40 hover:shadow-lg hover:shadow-[#00D4B2]/10"
      : ""
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00D4B2] to-transparent opacity-80" />
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
