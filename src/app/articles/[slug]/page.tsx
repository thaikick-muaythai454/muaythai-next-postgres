"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ARTICLES } from "@/lib/data";
import {
  CalendarIcon,
  UserIcon,
  TagIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  ShareIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { ArticleCard } from "@/components/ui/cards";

export default function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  // Get related articles from same category
  const relatedArticles = ARTICLES.filter(
    (a) => a.category === article.category && a.id !== article.id
  ).slice(0, 3);

  return (
    <div className="mt-16 min-h-screen text-white">
      {/* Breadcrumb & Back Button */}
      <div className="bg-zinc-950 border-zinc-800 border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-4xl">
          <div className="flex items-center gap-2 mb-4 text-zinc-400 text-sm">
            <Link href="/" className="hover:text-white transition-colors">
              หน้าแรก
            </Link>
            <ChevronRightIcon className="w-4 h-4" />
            <Link href="/articles" className="hover:text-white transition-colors">
              บทความ
            </Link>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-white">{article.title}</span>
          </div>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>กลับไปหน้าบทความ</span>
          </Link>
        </div>
      </div>

      {/* Article Content */}
      <article className="mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        {/* Category Badge */}
        <div className="mb-4">
          <span className="inline-block bg-red-600 px-4 py-1 rounded-full font-semibold text-white text-sm">
            {article.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-6 font-bold text-4xl md:text-5xl leading-tight">
          {article.title}
        </h1>

        {/* Meta Information */}
        <div className="flex md:flex-row flex-col gap-4 mb-8 pb-8 border-zinc-800 border-b text-zinc-400 text-sm">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            <span>
              {new Date(article.date).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative mb-8 rounded-xl w-full h-64 md:h-96 overflow-hidden">
          <Image
            src="/assets/images/fallback-img-2.jpg"
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Excerpt */}
        <div className="bg-zinc-900 mb-8 p-6 border-zinc-800 border-l-4 border-l-red-600 rounded-r-lg">
          <p className="text-zinc-300 text-lg leading-relaxed">{article.excerpt}</p>
        </div>

        {/* Content */}
        <div className="prose-invert max-w-none prose prose-lg">
          <div className="space-y-6 text-zinc-300 text-lg leading-relaxed">
            {article.content.split("\n\n").map((paragraph, index) => {
              // Check if paragraph starts with a number (for numbered lists)
              if (/^\d+\./.test(paragraph.trim())) {
                return (
                  <div key={index} className="space-y-4">
                    {paragraph.split('\n').map((line, lineIndex) => {
                      if (/^\d+\./.test(line.trim())) {
                        return (
                          <div key={lineIndex} className="flex items-start gap-4">
                            <span className="flex flex-shrink-0 justify-center items-center bg-red-600 rounded-full w-8 h-8 font-bold text-white text-sm">
                              {line.match(/^\d+/)?.[0]}
                            </span>
                            <p className="mt-1 text-zinc-300 text-lg leading-relaxed">
                              {line.replace(/^\d+\.\s*/, '')}
                            </p>
                          </div>
                        );
                      } else if (line.trim().startsWith('-')) {
                        return (
                          <div key={lineIndex} className="flex items-start gap-3 ml-12">
                            <span className="mt-2 text-red-400">•</span>
                            <p className="text-zinc-300 text-lg leading-relaxed">
                              {line.replace(/^-\s*/, '')}
                            </p>
                          </div>
                        );
                      } else if (line.trim()) {
                        return (
                          <p key={lineIndex} className="ml-12 text-zinc-300 text-lg leading-relaxed">
                            {line}
                          </p>
                        );
                      }
                      return null;
                    })}
                  </div>
                );
              }
              
              // Check if paragraph contains bullet points
              if (paragraph.includes('-')) {
                return (
                  <div key={index} className="space-y-3">
                    {paragraph.split('\n').map((line, lineIndex) => {
                      if (line.trim().startsWith('-')) {
                        return (
                          <div key={lineIndex} className="flex items-start gap-3">
                            <span className="mt-2 text-red-400">•</span>
                            <p className="text-zinc-300 text-lg leading-relaxed">
                              {line.replace(/^-\s*/, '')}
                            </p>
                          </div>
                        );
                      } else if (line.trim()) {
                        return (
                          <p key={lineIndex} className="text-zinc-300 text-lg leading-relaxed">
                            {line}
                          </p>
                        );
                      }
                      return null;
                    })}
                  </div>
                );
              }
              
              // Regular paragraph
              return (
                <p key={index} className="text-zinc-300 text-lg leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>

        {/* Social Actions */}
        <div className="mt-12 pt-8 border-zinc-800 border-t">
          <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-6">
            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex items-center gap-3">
                <TagIcon className="w-5 h-5 text-zinc-400" />
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg font-medium text-zinc-300 text-sm transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social Actions */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-zinc-300 hover:text-white transition-colors">
                <HeartIcon className="w-5 h-5" />
                <span>ชอบ</span>
              </button>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: article.title,
                      text: article.excerpt,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('คัดลอกลิงก์แล้ว');
                  }
                }}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-zinc-300 hover:text-white transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
                <span>แชร์</span>
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="bg-zinc-900 mt-12 py-12 border-zinc-800 border-t">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <h2 className="mb-8 font-bold text-white text-2xl">บทความที่เกี่ยวข้อง</h2>
            <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
              {relatedArticles.map((related) => (
                <ArticleCard key={related.id} article={related} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

