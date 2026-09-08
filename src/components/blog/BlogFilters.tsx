"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { FormEvent, useTransition } from "react";

type CategoryChip = {
  slug: string;
  label: string;
  count: number;
};

export function BlogFilters({
  categories,
  allLabel,
  searchPlaceholder,
  searchLabel,
}: {
  categories: CategoryChip[];
  allLabel: string;
  searchPlaceholder: string;
  searchLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const active = searchParams.get("category") ?? "";
  const q = searchParams.get("q") ?? "";

  function setCategory(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!slug) params.delete("category");
    else params.set("category", slug);
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = String(form.get("q") ?? "");
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSearch} className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="blog-search">
          {searchLabel}
        </label>
        <input
          id="blog-search"
          name="q"
          defaultValue={q}
          placeholder={searchPlaceholder}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-teal focus:ring-2"
        />
        <button
          type="submit"
          className="rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white dark:bg-teal dark:text-midnight"
          disabled={pending}
        >
          {searchLabel}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            !active
              ? "bg-navy text-white dark:bg-teal dark:text-midnight"
              : "border border-border text-muted-fg"
          }`}
        >
          {allLabel}
        </button>
        {categories.map((category) => (
          <button
            key={category.slug}
            type="button"
            onClick={() => setCategory(category.slug)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              active === category.slug
                ? "bg-navy text-white dark:bg-teal dark:text-midnight"
                : "border border-border text-muted-fg"
            }`}
          >
            {category.label}
            <span className="ml-1 opacity-70">({category.count})</span>
          </button>
        ))}
      </div>

      {/* Keep Link for crawlers when filters empty */}
      <Link href="/blog" className="sr-only">
        {allLabel}
      </Link>
    </div>
  );
}
