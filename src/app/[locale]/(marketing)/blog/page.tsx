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

export default async function BlogIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const { locale } = await params;
  const filters = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");

  const page = Number(filters.page || "1") || 1;

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
              searchLabel={t("search")}
              searchPlaceholder={t("searchPlaceholder")}
              categories={categories.map((category) => ({
                slug: category.slug,
                label: isSo ? category.nameSo : category.nameEn,
                count: category._count.posts,
              }))}
            />
          </Suspense>
        </div>

        {posts.length === 0 ? (
          <p className="mt-16 text-center text-muted-fg">{t("empty")}</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <PostCard
                key={post.id}
                index={index}
                slug={post.slug}
                title={isSo ? post.titleSo : post.titleEn}
                excerpt={isSo ? post.excerptSo : post.excerptEn}
                coverImageUrl={post.coverImageUrl}
                dateLabel={(post.publishedAt ?? post.createdAt).toLocaleDateString(
                  locale,
                  { year: "numeric", month: "short", day: "numeric" },
                )}
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
                href={`/blog?${new URLSearchParams({
                  ...(filters.category
                    ? { category: filters.category }
                    : {}),
                  ...(filters.q ? { q: filters.q } : {}),
                  page: String(currentPage - 1),
                }).toString()}`}
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
                href={`/blog?${new URLSearchParams({
                  ...(filters.category
                    ? { category: filters.category }
                    : {}),
                  ...(filters.q ? { q: filters.q } : {}),
                  page: String(currentPage + 1),
                }).toString()}`}
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
