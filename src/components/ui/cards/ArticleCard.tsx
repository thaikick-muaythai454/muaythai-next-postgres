"use client";

import Link from "next/link";
import Image from "next/image";
import { CalendarIcon, UserIcon, TagIcon } from "@heroicons/react/24/outline";
import { BaseCard } from "./BaseCard";

export interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  tags?: string[];
}

export interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <BaseCard>
      <Link href={`/articles/${article.slug}`} className="block">
        {/* Image */}
        <div className="relative w-full h-48">
          <Image
            src="/assets/images/fallback-img-2.jpg"
            alt={article.title}
            fill
            className="object-cover"
          />
          <div className="top-3 right-3 absolute">
            <span className="bg-red-600 px-3 py-1 rounded-full font-semibold text-white text-xs">
              {article.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="mb-3 font-bold text-white group-hover:text-red-400 text-xl line-clamp-2 transition-colors">
            {article.title}
          </h2>
          <p className="mb-4 text-zinc-400 text-sm line-clamp-3">
            {article.excerpt}
          </p>

          {/* Meta */}
          <div className="space-y-2 text-zinc-500 text-xs">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span>
                {new Date(article.date).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            {article.tags && article.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <TagIcon className="w-4 h-4" />
                <div className="flex flex-wrap gap-1">
                  {article.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </BaseCard>
  );
}

