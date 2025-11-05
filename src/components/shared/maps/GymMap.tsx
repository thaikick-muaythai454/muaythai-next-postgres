"use client";

import { memo } from "react";
import { LeafletGymMap } from "./LeafletGymMap";

interface GymMapProps {
  latitude?: number | null;
  longitude?: number | null;
  mapUrl?: string | null;
  gymName?: string;
  useLeaflet?: boolean;
}

/**
 * GymMap component - Displays map for gym detail page
 * Supports both Leaflet (free, customizable dark red theme) and Google Maps embed
 */
export const GymMap = memo(function GymMap({ 
  latitude, 
  longitude, 
  mapUrl, 
  gymName,
  useLeaflet = true,
}: GymMapProps) {
  // Use LeafletGymMap which supports both Leaflet and Google Maps
  return (
    <LeafletGymMap
      latitude={latitude}
      longitude={longitude}
      mapUrl={mapUrl}
      gymName={gymName}
      useLeaflet={useLeaflet}
    />
  );
});


