"use client";

import { memo } from "react";
import { LeafletMap } from "./LeafletMap";

interface LeafletContactMapProps {
  address?: string;
  latitude?: number;
  longitude?: number;
  mapUrl?: string;
  useLeaflet?: boolean;
}

/**
 * ContactMap component with option to use Leaflet or Google Maps embed
 * Leaflet provides free, customizable dark red theme
 */
export const LeafletContactMap = memo(function LeafletContactMap({
  address,
  latitude,
  longitude,
  mapUrl,
  useLeaflet = true,
}: LeafletContactMapProps) {
  // Default office location: 123 Sukhumvit Road, Khlong Toei, Watthana, Bangkok 10110
  const defaultLat = 13.7300;
  const defaultLon = 100.5680;
  const defaultAddress = "123 ถนนสุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพฯ 10110";

  const hasCoords = typeof latitude === "number" && typeof longitude === "number";
  const finalLat = hasCoords ? latitude : defaultLat;
  const finalLon = hasCoords ? longitude : defaultLon;
  const finalAddress = address || defaultAddress;

  // Google Maps embed (fallback)
  const embedSrc = `https://www.google.com/maps?q=${finalLat},${finalLon}&z=15&output=embed`;

  return (
    <div className="bg-zinc-950 p-8 rounded-lg">
      <h2 className="mb-6 font-bold text-2xl text-center">แผนที่สำนักงาน</h2>
      <div className="mb-4 text-center">
        <p className="text-zinc-300">{finalAddress}</p>
      </div>
      
      {useLeaflet ? (
        <LeafletMap
          latitude={finalLat}
          longitude={finalLon}
          address={finalAddress}
          title="สำนักงาน"
          height="500px"
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <iframe
            title="แผนที่สำนักงาน"
            src={embedSrc}
            className="w-full h-[400px] md:h-[500px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      )}
      
      {mapUrl && (
        <div className="mt-4 text-center">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg transition-colors"
          >
            เปิดใน Google Maps
          </a>
        </div>
      )}
    </div>
  );
});

