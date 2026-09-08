import { BlogFilters } from "@/components/blog/BlogFilters";
import { PostCard } from "@/components/blog/PostCard";
import { Link } from "@/i18n/navigation";
import { getBlogCategories, getPublishedPosts } from "@/lib/blog";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

function buildBlogQuery(filters: {
  category?: string;
  q?: string;
  period?: string;
  day?: string;
  page?: string | number;
}) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.q) params.set("q", filters.q);
  if (filters.period) params.set("period", filters.period);
  if (filters.day) params.set("day", filters.day);
  if (filters.page && Number(filters.page) > 1) {
    params.set("page", String(filters.page));
  }
  const qs = params.toString();
  return qs ? `/blog?${qs}` : "/blog";
}

export default async function BlogIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    category?: string;
    q?: string;
    page?: string;
    period?: string;
    day?: string;
  }>;
}) {
  const { locale } = await params;
  const filters = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");

  const page = Number(filters.page || "1") || 1;
  const hasFilters = Boolean(
    filters.category || filters.q || filters.period || filters.day,
  );
  const emptyFiltered =
    locale === "so"
      ? "Maqaallo kuma jiraan filter-yadan."
      : "No articles match these filters.";
  const emptyDefault = t("empty");

  let posts: Awaited<ReturnType<typeof getPublishedPosts>>["posts"] = [];
  let totalPages = 1;
  let currentPage = page;
  let categories: Awaited<ReturnType<typeof getBlogCategories>> = [];

  try {
    const [postResult, categoryResult] = await Promise.all([
      getPublishedPosts({
        category: filters.category,
        q: filters.q,
        page,
        period: filters.period,
        day: filters.day,
      }),
      getBlogCategories(),
    ]);
    posts = postResult.posts;
    totalPages = postResult.totalPages;
    currentPage = postResult.page;
    categories = categoryResult;
  } catch {
    // Database not configured yet — show empty public blog
  }

  const isSo = locale === "so";

  return (
    <section className="bg-atmosphere pb-20 pt-14 sm:pt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-teal">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-base text-muted-fg sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-10">
          <Suspense fallback={null}>
            <BlogFilters
              allLabel={t("allCategories")}
              categories={categories.map((category) => ({
                slug: category.slug,
                label: isSo ? category.nameSo : category.nameEn,
                count: category._count.posts,
              }))}
            />
          </Suspense>
        </div>

        {posts.length === 0 ? (
          <p className="mt-16 text-center text-muted-fg">
            {hasFilters ? emptyFiltered : emptyDefault}
          </p>
        ) : (
          <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {posts.map((post, index) => (
              <PostCard
                key={post.id}
                index={index}
                slug={post.slug}
                title={isSo ? post.titleSo : post.titleEn}
                excerpt={isSo ? post.excerptSo : post.excerptEn}
                coverImageUrl={post.coverImageUrl}
                date={post.publishedAt ?? post.createdAt}
                locale={locale}
                authorName={post.author.name}
                authorAvatarUrl={post.author.avatarUrl}
                categories={post.categories.map((item) =>
                  isSo ? item.category.nameSo : item.category.nameEn,
                )}
              />
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <div className="mt-12 flex items-center justify-center gap-3">
            {currentPage > 1 ? (
              <Link
                href={buildBlogQuery({
                  ...filters,
                  page: currentPage - 1,
                })}
                className="rounded-xl border border-border px-4 py-2 text-sm font-semibold"
              >
                {t("prev")}
              </Link>
            ) : null}
            <span className="text-sm text-muted-fg">
              {currentPage} / {totalPages}
            </span>
            {currentPage < totalPages ? (
              <Link
                href={buildBlogQuery({
                  ...filters,
                  page: currentPage + 1,
                })}
                className="rounded-xl border border-border px-4 py-2 text-sm font-semibold"
              >
                {t("next")}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
