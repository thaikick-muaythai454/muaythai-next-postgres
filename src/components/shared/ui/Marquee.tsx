"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/database/supabase/client";
import Link from "next/link";

interface Promotion {
  id: string;
  title: string;
  title_english?: string | null;
  link_url?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  priority?: number | null;
}

export default function Marquee() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    async function fetchPromotions() {
      try {
        const supabase = createClient();
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from("promotions")
          .select("id, title, title_english, link_url, start_date, end_date, priority")
          .eq("is_active", true)
          .eq("show_in_marquee", true)
          .order("priority", { ascending: false })
          .limit(20);

        if (error) {
          console.error('Error fetching promotions:', error);
          // Set empty array on error to show placeholder
          setPromotions([]);
          return;
        }

        const nowDate = new Date(now);
        const filteredPromotions =
          (data ?? []).filter((promo) => {
            const startsBeforeNow =
              !promo.start_date || new Date(promo.start_date) <= nowDate;
            const endsAfterNow =
              !promo.end_date || new Date(promo.end_date) >= nowDate;

            return startsBeforeNow && endsAfterNow;
          });

        setPromotions(filteredPromotions.slice(0, 5));
      } catch (error) {
        // Handle connection errors (ERR_CONNECTION_REFUSED, etc.)
        console.error('Failed to fetch promotions:', error);
        // Set empty array to show placeholder
        setPromotions([]);
      }
    }

    fetchPromotions();
  }, []);

  // Placeholder when no promotions
  const placeholderPromotions = Array(16).fill({ id: "placeholder", title: "Advertisement here" });
  const displayPromotions = promotions.length > 0 
    ? [...promotions, ...promotions] // Duplicate for seamless loop
    : placeholderPromotions;

  return (
    <div className="relative bg-linear-to-r from-red-600 to-red-700 py-3 w-full overflow-hidden">
      <div className="flex gap-8 whitespace-nowrap animate-marquee">
        {displayPromotions.map((promo, i) => (
          <span key={`${promo.id}-${i}`} className="font-bold text-lg tracking-wider">
            {promo.link_url ? (
              <Link
                href={promo.link_url}
                className="hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {promo.title}
              </Link>
            ) : (
              promo.title
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
