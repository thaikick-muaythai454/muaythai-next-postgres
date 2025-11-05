"use client";

import { memo } from "react";
import { LeafletContactMap } from "./LeafletContactMap";

interface ContactMapProps {
  address?: string;
  latitude?: number;
  longitude?: number;
  mapUrl?: string;
  useLeaflet?: boolean;
}

/**
 * ContactMap component - Displays map for contact page
 * Supports both Leaflet (free, customizable dark red theme) and Google Maps embed
 */
export const ContactMap = memo(function ContactMap({ 
  address, 
  latitude, 
  longitude, 
  mapUrl,
  useLeaflet = true,
}: ContactMapProps) {
  // Use LeafletContactMap which supports both Leaflet and Google Maps
  return (
    <LeafletContactMap
      address={address}
      latitude={latitude}
      longitude={longitude}
      mapUrl={mapUrl}
      useLeaflet={useLeaflet}
    />
  );
});

