"use client";

import { InfoWindow } from "@vis.gl/react-google-maps";
import { Calendar, MapPin, X } from "lucide-react";

type MediaItem = {
  type: "photo" | "video" | "audio";
  url: string;
  thumbnail?: string;
  caption?: string;
};

type MediaPopupProps = {
  position: { lat: number; lng: number };
  title: string;
  description: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  visitDate?: string;
  media: MediaItem[];
  onClose: () => void;
  onViewDetails: () => void;
};

export function MediaPopup({
  position,
  title,
  description,
  location,
  visitDate,
  media,
  onClose,
  onViewDetails,
}: MediaPopupProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <InfoWindow onCloseClick={onClose} position={position}>
      <div className="max-w-sm p-2">
        {/* Header */}
        <div className="mb-2 flex items-start justify-between">
          <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
          <button
            aria-label="Close popup"
            className="text-gray-500 transition-colors hover:text-gray-700"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Location & Date Info */}
        <div className="mb-3 space-y-1 text-gray-600 text-sm">
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>
                {location.city}, {location.state}, {location.country}
              </span>
            </div>
          )}
          {visitDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(visitDate)}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="mb-3 line-clamp-3 text-gray-600 text-sm">{description}</p>

        {/* Media Preview */}
        {media.length > 0 && (
          <div className="mb-3 grid grid-cols-2 gap-2">
            {media.slice(0, 4).map((item, i) => (
              <div
                className="aspect-square overflow-hidden rounded"
                key={`${item.type}-${i}`}
              >
                {item.type === "photo" && (
                  <img
                    alt={item.caption || `Photo ${i + 1}`}
                    className="h-full w-full object-cover"
                    src={item.thumbnail || item.url}
                  />
                )}
                {item.type === "video" && (
                  <video
                    className="h-full w-full object-cover"
                    muted
                    src={item.url}
                  />
                )}
                {item.type === "audio" && (
                  <div className="flex h-full w-full items-center justify-center bg-gray-200">
                    <span className="text-gray-600 text-xs">Audio</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* View Details Button */}
        <button
          className="w-full rounded bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700"
          onClick={onViewDetails}
          type="button"
        >
          View Full Story
        </button>
      </div>
    </InfoWindow>
  );
}
