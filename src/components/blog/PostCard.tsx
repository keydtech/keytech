"use client";

import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

type PostCardProps = {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string | null;
  dateLabel: string;
  categories: string[];
  index?: number;
};

export function PostCard({
  slug,
  title,
  excerpt,
  coverImageUrl,
  dateLabel,
  categories,
  index = 0,
}: PostCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        href={`/blog/${slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface/50 transition hover:border-teal/40"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt=""
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(0,212,178,0.25),transparent_55%)]">
              <span className="font-display text-sm font-semibold text-teal">
                KeydTech Insights
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 2).map((category) => (
              <span key={category} className="text-xs font-semibold text-teal">
                {category}
              </span>
            ))}
          </div>
          <h3 className="mt-2 font-display text-lg font-semibold tracking-tight text-foreground group-hover:text-navy dark:group-hover:text-teal">
            {title}
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-fg">
            {excerpt}
          </p>
          <p className="mt-4 text-xs text-muted-fg">{dateLabel}</p>
        </div>
      </Link>
    </motion.article>
  );
}
