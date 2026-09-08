/** Inclusive calendar-day ranges in local timezone, returned as UTC Dates for Prisma. */

export type BlogDatePeriod = "today" | "yesterday" | "week" | "day";

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function endOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function parseDayParam(day: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const [y, m, d] = day.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return date;
}

export function resolveBlogDateRange(options: {
  period?: string | null;
  day?: string | null;
}): { gte: Date; lte: Date } | null {
  const day = options.day?.trim();
  if (day) {
    const parsed = parseDayParam(day);
    if (!parsed) return null;
    return { gte: startOfLocalDay(parsed), lte: endOfLocalDay(parsed) };
  }

  const period = options.period?.trim();
  if (!period) return null;

  const now = new Date();
  if (period === "today") {
    return { gte: startOfLocalDay(now), lte: endOfLocalDay(now) };
  }
  if (period === "yesterday") {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return { gte: startOfLocalDay(y), lte: endOfLocalDay(y) };
  }
  if (period === "week") {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    return { gte: startOfLocalDay(start), lte: endOfLocalDay(now) };
  }
  return null;
}

export function toDateInputValue(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
