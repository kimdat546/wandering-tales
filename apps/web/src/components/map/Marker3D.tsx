"use client";

import { useEffect, useRef } from "react";

type Marker3DProps = {
  position: { lat: number; lng: number; altitude?: number };
  title: string;
  onClick?: () => void;
  altitudeMode?: "ABSOLUTE" | "RELATIVE_TO_GROUND" | "CLAMP_TO_GROUND";
  extruded?: boolean;
  background?: string;
  borderColor?: string;
  glyphColor?: string;
  scale?: number;
};

export function Marker3D({
  position,
  title,
  onClick,
  altitudeMode = "CLAMP_TO_GROUND",
  extruded = false,
  background = "#0ea5e9",
  borderColor = "#0369a1",
  glyphColor = "#ffffff",
  scale = 1.5,
}: Marker3DProps) {
  const markerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Create custom pin element with styling
    const pin = document.createElement("gmp-pin") as HTMLElement & {
      background: string;
      borderColor: string;
      glyphColor: string;
      scale: number;
    };

    pin.background = background;
    pin.borderColor = borderColor;
    pin.glyphColor = glyphColor;
    pin.scale = scale;

    // Create interactive marker element (allows click events)
    const marker = document.createElement("gmp-marker-3d-interactive") as HTMLElement & {
      position: { lat: number; lng: number; altitude?: number };
      altitudeMode?: string;
      extruded?: boolean;
      title?: string;
    };

    marker.position = position;
    marker.altitudeMode = altitudeMode;
    marker.extruded = extruded;
    marker.title = title;

    // Append pin to marker
    marker.appendChild(pin);

    // Add click handler using gmp-click event
    if (onClick) {
      marker.addEventListener("gmp-click", onClick);
    }

    // Store ref
    markerRef.current = marker;

    // Find the map and append marker
    const map3d = document.querySelector("gmp-map-3d");
    if (map3d) {
      map3d.appendChild(marker);
    }

    // Cleanup
    return () => {
      if (onClick && markerRef.current) {
        markerRef.current.removeEventListener("gmp-click", onClick);
      }
      if (markerRef.current?.parentNode) {
        markerRef.current.parentNode.removeChild(markerRef.current);
      }
    };
  }, [position, title, onClick, altitudeMode, extruded, background, borderColor, glyphColor, scale]);

  return null;
}
