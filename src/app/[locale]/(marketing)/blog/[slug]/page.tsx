import { PostCard } from "@/components/blog/PostCard";
import { Link } from "@/i18n/navigation";
import { getPostBySlug, getRelatedPosts } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);
  if (!post) return {};

  const isSo = locale === "so";
  const title = isSo
    ? post.seoTitleSo || post.titleSo
    : post.seoTitleEn || post.titleEn;
  const description = isSo
    ? post.seoDescSo || post.excerptSo
    : post.seoDescEn || post.excerptEn;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/blog/${post.slug}`,
      languages: {
        en: `${SITE_URL}/en/blog/${post.slug}`,
        so: `${SITE_URL}/so/blog/${post.slug}`,
      },
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${SITE_URL}/${locale}/blog/${post.slug}`,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");
  const post = await getPostBySlug(slug).catch(() => null);
  if (!post) notFound();

  const isSo = locale === "so";
  const title = isSo ? post.titleSo : post.titleEn;
  const content = isSo ? post.contentSo : post.contentEn;
  const categoryIds = post.categories.map((item) => item.categoryId);
  const related = await getRelatedPosts(post.slug, categoryIds).catch(() => []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: isSo ? post.excerptSo : post.excerptEn,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    image: post.coverImageUrl || undefined,
    mainEntityOfPage: `${SITE_URL}/${locale}/blog/${post.slug}`,
    inLanguage: locale,
  };

  return (
    <article className="bg-atmosphere pb-20 pt-14 sm:pt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="text-sm font-semibold text-teal hover:underline"
        >
          ← {t("back")}
        </Link>

        <div className="mt-6 flex flex-wrap gap-2">
          {post.categories.map((item) => (
            <Link
              key={item.categoryId}
              href={`/blog?category=${item.category.slug}`}
              className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-teal"
            >
              {isSo ? item.category.nameSo : item.category.nameEn}
            </Link>
          ))}
        </div>

        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
          {title}
        </h1>

        <p className="mt-4 text-sm text-muted-fg">
          {post.author.name} ·{" "}
          {(post.publishedAt ?? post.createdAt).toLocaleDateString(locale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {post.coverImageUrl ? (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
            <Image
              src={post.coverImageUrl}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        ) : null}

        <div
          className="blog-prose mt-10"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {related.length > 0 ? (
        <div className="mx-auto mt-20 max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold">{t("related")}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item, index) => (
              <PostCard
                key={item.id}
                index={index}
                slug={item.slug}
                title={isSo ? item.titleSo : item.titleEn}
                excerpt={isSo ? item.excerptSo : item.excerptEn}
                coverImageUrl={item.coverImageUrl}
                dateLabel={(
                  item.publishedAt ?? item.createdAt
                ).toLocaleDateString(locale, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                categories={item.categories.map((entry) =>
                  isSo ? entry.category.nameSo : entry.category.nameEn,
                )}
              />
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
