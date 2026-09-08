"use client";

import { AuthorByline } from "@/components/blog/AuthorByline";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

type PostCardProps = {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string | null;
  date: string | Date;
  locale?: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  categories: string[];
  index?: number;
};

export function PostCard({
  slug,
  title,
  excerpt,
  coverImageUrl,
  date,
  locale = "en",
  authorName,
  authorAvatarUrl,
  categories,
  index = 0,
}: PostCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="h-full"
    >
      <Link
        href={`/blog/${slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface/70 shadow-[0_10px_30px_rgba(10,37,64,0.04)] transition hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-[0_16px_40px_rgba(10,37,64,0.08)] dark:bg-surface dark:shadow-none"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt=""
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(0,212,178,0.28),transparent_55%)]">
              <span className="font-display text-sm font-semibold text-teal">
                KeydTech Insights
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 2).map((category) => (
              <span
                key={category}
                className="rounded-full bg-teal/10 px-2.5 py-0.5 text-[11px] font-semibold text-teal"
              >
                {category}
              </span>
            ))}
          </div>
          <h3 className="mt-2.5 font-display text-lg font-semibold tracking-tight text-balance text-foreground group-hover:text-navy dark:group-hover:text-teal sm:text-[1.15rem]">
            {title}
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-fg">
            {excerpt}
          </p>
          <div className="mt-4 border-t border-border pt-3">
            <AuthorByline
              name={authorName}
              avatarUrl={authorAvatarUrl}
              date={date}
              locale={locale}
              size="sm"
            />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
