"use client";

import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

type TravelMarkerProps = {
  position: { lat: number; lng: number };
  title: string;
  thumbnail?: string;
  onClick: () => void;
};

export function TravelMarker({
  position,
  title,
  thumbnail,
  onClick,
}: TravelMarkerProps) {
  return (
    <AdvancedMarker onClick={onClick} position={position}>
      {thumbnail ? (
        <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110">
          <img
            alt={title}
            className="h-full w-full object-cover"
            src={thumbnail}
          />
        </div>
      ) : (
        <Pin
          background="#0ea5e9"
          borderColor="#0369a1"
          glyphColor="#ffffff"
          scale={1.2}
        />
      )}
    </AdvancedMarker>
  );
}
