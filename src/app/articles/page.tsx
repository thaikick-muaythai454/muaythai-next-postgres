"use client";

import { useState } from "react";
import { ARTICLES } from "@/lib/data";
import { PageHeader } from "@/components/shared/PageHeader";
import { ArticleCard } from "@/components/ui/cards";

export default function ArticlesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ทั้งหมด");

  const categories = ["ทั้งหมด", ...Array.from(new Set(ARTICLES.map(a => a.category)))];

  const filteredArticles = selectedCategory === "ทั้งหมด" 
    ? ARTICLES 
    : ARTICLES.filter(a => a.category === selectedCategory);

  return (
    <div className="min-h-screen text-white">
      <PageHeader 
        title="บทความมวยไทย" 
        description="เรียนรู้เกี่ยวกับมวยไทย ตั้งแต่ประวัติศาสตร์ เทคนิค การฝึกซ้อม และอีกมากมาย"
      />

      {/* Category Filter */}
      <div className="border-zinc-800 border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  selectedCategory === category
                    ? "bg-red-600 text-white"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        <div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-zinc-500 text-xl">ไม่พบบทความในหมวดหมู่นี้</p>
          </div>
        )}
      </div>
    </div>
  );
}

