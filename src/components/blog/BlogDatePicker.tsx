"use client";

import { toDateInputValue } from "@/lib/blog-date";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

const WEEKDAYS_EN = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const WEEKDAYS_SO = ["Is", "Tl", "Ar", "Kh", "Jm", "Sb", "Ax"];

const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTHS_SO = [
  "Janaayo",
  "Febraayo",
  "Maarso",
  "Abriil",
  "May",
  "Juun",
  "Luuliyo",
  "Agoosto",
  "Sebteembar",
  "Oktoobar",
  "Nofeembar",
  "Diseembar",
];

function parseYmd(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [];

  for (let i = 0; i < startPad; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function BlogDatePicker({
  value,
  locale = "en",
  onSelect,
  onClear,
  clearLabel,
  todayLabel,
}: {
  value: string;
  locale?: string;
  onSelect: (ymd: string) => void;
  onClear?: () => void;
  clearLabel: string;
  todayLabel: string;
}) {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const selected = parseYmd(value);
  const initial = selected ?? today;

  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const isSo = locale === "so";
  const weekdays = isSo ? WEEKDAYS_SO : WEEKDAYS_EN;
  const months = isSo ? MONTHS_SO : MONTHS_EN;
  const cells = useMemo(
    () => buildMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const canGoNext =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth < today.getMonth());

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (!canGoNext) return;
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  return (
    <div className="w-[240px] overflow-hidden rounded-xl border border-teal/25 bg-background shadow-[0_16px_40px_rgba(10,37,64,0.16)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between gap-1 bg-gradient-to-r from-navy to-[#123456] px-2.5 py-2 text-offwhite">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded-md p-1 text-offwhite/80 transition hover:bg-white/10 hover:text-white"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <p className="font-display text-xs font-semibold tracking-tight">
          {months[viewMonth]} {viewYear}
        </p>
        <button
          type="button"
          onClick={nextMonth}
          disabled={!canGoNext}
          className="rounded-md p-1 text-offwhite/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Next month"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="p-2">
        <div className="mb-1 grid grid-cols-7 gap-0.5">
          {weekdays.map((label) => (
            <div
              key={label}
              className="py-0.5 text-center text-[10px] font-semibold text-muted-fg"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="h-7 w-7" />;
            }

            const ymd = toDateInputValue(date);
            const isSelected = selected ? sameDay(date, selected) : false;
            const isToday = sameDay(date, today);
            const isFuture = date.getTime() > today.getTime();

            return (
              <button
                key={ymd}
                type="button"
                disabled={isFuture}
                onClick={() => onSelect(ymd)}
                className={cn(
                  "h-7 w-7 rounded-lg text-[11px] font-semibold transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50",
                  isFuture && "cursor-not-allowed text-muted-fg/35",
                  !isFuture &&
                    !isSelected &&
                    "text-foreground hover:bg-teal/15 hover:text-navy dark:hover:text-teal",
                  isToday &&
                    !isSelected &&
                    "ring-1 ring-teal/50 ring-inset text-teal",
                  isSelected && "bg-teal text-midnight",
                )}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-border pt-1.5">
          <button
            type="button"
            onClick={() => {
              setViewYear(today.getFullYear());
              setViewMonth(today.getMonth());
              onSelect(toDateInputValue(today));
            }}
            className="rounded-md px-1.5 py-1 text-[11px] font-semibold text-teal transition hover:bg-teal/10"
          >
            {todayLabel}
          </button>
          {onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="rounded-md px-1.5 py-1 text-[11px] font-semibold text-muted-fg transition hover:bg-muted hover:text-foreground"
            >
              {clearLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
