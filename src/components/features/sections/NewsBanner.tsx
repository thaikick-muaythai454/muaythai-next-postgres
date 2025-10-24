"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// Sample news data - in a real app, this would come from an API
const NEWS_ITEMS = [
  {
    id: 1,
    title: "เปิดตัวโปรแกรมนักสู้รุ่นใหม่ 2025",
    description: "สมัครเข้าร่วมโปรแกรมพัฒนานักสู้รุ่นใหม่ พร้อมรับสิทธิพิเศษมากมาย",
    href: "/fighter-program",
    isNew: true,
  },
  {
    id: 2,
    title: "ค่ายมวยชั้นนำเพิ่มขึ้น 20% ในปีนี้",
    description: "พบกับค่ายมวยคุณภาพสูงกว่า 50 แห่งทั่วประเทศไทย",
    href: "/gyms",
    isNew: false,
  },
  {
    id: 3,
    title: "ตั๋วเวทีมวยลุมพินี เปิดขายแล้ว",
    description: "จองตั๋วชมการแข่งขันมวยระดับโลกที่เวทีลุมพินี",
    href: "/events",
    isNew: true,
  },
  {
    id: 4,
    title: "โปรโมชั่นพิเศษเดือนมกราคม",
    description: "ลดราคาแพ็กเกจฝึกซ้อม 30% สำหรับสมาชิกใหม่",
    href: "/shop",
    isNew: false,
  },
];

function NewsItem({ item }: { item: typeof NEWS_ITEMS[0] }) {
  return (
    <Link
      href={item.href}
      className="group relative flex flex-col bg-gradient-to-r from-zinc-900/90 to-zinc-800/90 backdrop-blur-sm border border-zinc-700/50 rounded-lg p-4 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10"
    >
      {item.isNew && (
        <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
          ใหม่
        </div>
      )}
      <h3 className="text-white font-semibold text-sm md:text-base mb-2 group-hover:text-red-400 transition-colors">
        {item.title}
      </h3>
      <p className="text-zinc-400 text-xs md:text-sm line-clamp-2">
        {item.description}
      </p>
    </Link>
  );
}

function NewsBannerContent() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % NEWS_ITEMS.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-y border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <h2 className="text-white font-bold text-lg md:text-xl">
              ข่าวสารและโปรโมชั่น
            </h2>
          </div>
          <Link
            href="/articles"
            className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
          >
            ดูทั้งหมด →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {NEWS_ITEMS.map((item) => (
            <NewsItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function NewsBanner() {
  return <NewsBannerContent />;
}
