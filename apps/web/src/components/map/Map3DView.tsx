"use client";

import { APIProvider, type MapMouseEvent } from "@vis.gl/react-google-maps";
import { api } from "@wandering-tales/backend/convex/_generated/api";
import type { Id } from "@wandering-tales/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Calendar, MapPin, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { ImageSwiper } from "./ImageSwiper";
import { Marker3D } from "./Marker3D";
import { Map3D, type Map3DCameraProps } from "./map-3d";
import { MiniMap } from "./minimap";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;

const INITIAL_CAMERA: Map3DCameraProps = {
  center: { lat: 20.5937, lng: 78.9629, altitude: 0 }, // India center
  range: 5_000_000,
  heading: 0,
  tilt: 45,
  roll: 0,
};

const DISTANCE_MULTIPLIER = 111;

// Helper function to get country flag emoji
function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    Vietnam: "🇻🇳",
    China: "🇨🇳",
    "United Arab Emirates": "🇦🇪",
    Japan: "🇯🇵",
    France: "🇫🇷",
    Spain: "🇪🇸",
  };
  return flags[country] || "📍";
}

export function Map3DView() {
  const router = useRouter();
  const map3DRef = useRef<google.maps.maps3d.Map3DElement | null>(null);
  const [cameraProps, setCameraProps] =
    useState<Map3DCameraProps>(INITIAL_CAMERA);
  const [selectedTravelId, setSelectedTravelId] =
    useState<Id<"travels"> | null>(null);
  const [showImageSwiper, setShowImageSwiper] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch all published travels
  const travels = useQuery(api.travels.getAllTravels);

  // Fetch selected travel details with media
  const selectedTravel = useQuery(
    api.travels.getTravelById,
    selectedTravelId ? { id: selectedTravelId } : "skip"
  );

  const handleCameraChange = useCallback((props: Map3DCameraProps) => {
    setCameraProps({ ...props });
  }, []);

  // FlyTo animation with zoom out -> travel -> zoom in effect
  const flyToLocation = useCallback(
    async (destination: { lat: number; lng: number }) => {
      const map3D = map3DRef.current;
      if (!map3D || isAnimating) {
        return;
      }

      setIsAnimating(true);

      try {
        // Step 1: Zoom out (high altitude view)
        await map3D.flyCameraTo({
          endCamera: {
            center: { ...cameraProps.center, altitude: 0 },
            range: 8_000_000, // Zoom way out
            heading: cameraProps.heading,
            tilt: 0, // Flatten view
            roll: 0,
          },
          durationMillis: 1000,
        });

        // Step 2: Travel to destination (maintain high altitude)
        await map3D.flyCameraTo({
          endCamera: {
            center: { lat: destination.lat, lng: destination.lng, altitude: 0 },
            range: 8_000_000,
            heading: 0,
            tilt: 0,
            roll: 0,
          },
          durationMillis: 2000,
        });

        // Step 3: Zoom in to destination
        await map3D.flyCameraTo({
          endCamera: {
            center: { lat: destination.lat, lng: destination.lng, altitude: 0 },
            range: 500_000, // Zoom in closer
            heading: 0,
            tilt: 60, // Nice angle
            roll: 0,
          },
          durationMillis: 1200,
        });
      } catch {
        // Animation was interrupted or failed
      } finally {
        setIsAnimating(false);
      }
    },
    [cameraProps, isAnimating]
  );

  const handleMapClick = useCallback((ev: MapMouseEvent) => {
    if (!ev.detail.latLng) {
      return;
    }

    const { lat, lng } = ev.detail.latLng;
    setCameraProps((p) => ({ ...p, center: { lat, lng, altitude: 0 } }));
  }, []);

  const handleMarkerClick = useCallback(
    (travelId: Id<"travels">, location: { lat: number; lng: number }) => {
      setSelectedTravelId(travelId);

      // Use smooth FlyTo animation
      flyToLocation(location).then(() => {
        // Show image swiper after animation completes
        setShowImageSwiper(true);
      });
    },
    [flyToLocation]
  );

  const handlePopupClose = useCallback(() => {
    setSelectedTravelId(null);
    setShowImageSwiper(false);
    // Zoom back out
    setCameraProps((prev) => ({
      ...prev,
      range: 5_000_000,
      tilt: 45,
    }));
  }, []);

  const handleImageSwiperClose = useCallback(() => {
    setShowImageSwiper(false);
    setSelectedTravelId(null);
    // Zoom back out
    setCameraProps((prev) => ({
      ...prev,
      range: 5_000_000,
      tilt: 45,
    }));
  }, []);

  const handleViewDetails = useCallback(() => {
    if (selectedTravelId) {
      // biome-ignore lint/suspicious/noExplicitAny: Next.js router type is too strict
      (router.push as any)(`/travel/${selectedTravelId}`);
    }
  }, [selectedTravelId, router]);

  return (
    <APIProvider apiKey={API_KEY} version="beta">
      <div className="relative h-screen w-full">
        {/* Main map with optimized grayscale filter */}
        <div
          className={`h-full w-full ${showImageSwiper ? "will-change-[filter]" : ""}`}
          style={
            showImageSwiper
              ? {
                  filter: "grayscale(100%)",
                  transition: "filter 0.15s ease-out",
                }
              : { transition: "filter 0.15s ease-out" }
          }
        >
          <Map3D
            {...cameraProps}
            defaultLabelsDisabled={false}
            onCameraChange={handleCameraChange}
            ref={map3DRef}
          >
            {/* Render 3D Markers */}
            {travels?.map((travel) => (
              <Marker3D
                key={travel._id}
                onClick={() =>
                  handleMarkerClick(travel._id, {
                    lat: travel.location.lat,
                    lng: travel.location.lng,
                  })
                }
                position={{
                  lat: travel.location.lat,
                  lng: travel.location.lng,
                }}
                title={travel.title}
              />
            ))}
          </Map3D>
        </div>

        {/* Gray overlay - fast GPU-accelerated */}
        <div
          className={`pointer-events-none absolute inset-0 z-10 bg-black/40 transition-opacity duration-150 ease-out ${
            showImageSwiper ? "opacity-100" : "opacity-0"
          }`}
          style={{ willChange: showImageSwiper ? "opacity" : "auto" }}
        />

        {/* Mult.dev-style Location List */}
        {travels && travels.length > 0 && (
          <div className="pointer-events-none absolute inset-0 z-20">
            <div className="pointer-events-auto absolute top-6 left-6 flex max-h-[calc(100vh-3rem)] w-64 flex-col overflow-hidden rounded-2xl bg-gray-900/95 shadow-2xl backdrop-blur-md">
              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto">
                {travels.map((travel, index) => {
                  const distance = Math.round(
                    Math.sqrt(
                      (travel.location.lat - cameraProps.center.lat) ** 2 +
                        (travel.location.lng - cameraProps.center.lng) ** 2
                    ) * DISTANCE_MULTIPLIER
                  );

                  return (
                    <button
                      className={`group relative flex w-full items-center justify-between border-gray-800 border-b px-4 py-3 text-left transition-all duration-200 hover:bg-gray-800/50 ${
                        selectedTravelId === travel._id ? "bg-gray-800" : ""
                      }`}
                      key={travel._id}
                      onClick={() =>
                        handleMarkerClick(travel._id, {
                          lat: travel.location.lat,
                          lng: travel.location.lng,
                        })
                      }
                      type="button"
                    >
                      {/* Left side: Flag + Number + Title */}
                      <div className="flex min-w-0 flex-1 items-center gap-2.5">
                        {/* Country Flag */}
                        <span className="flex-shrink-0 text-xl leading-none">
                          {getCountryFlag(travel.location.country)}
                        </span>

                        {/* Number + Title */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-gray-500 text-xs">
                              {index + 1}
                            </span>
                            <span className="truncate font-medium text-sm text-white">
                              {travel.title}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right side: Distance with airplane icon */}
                      <div className="ml-3 flex flex-shrink-0 items-center gap-1.5 text-gray-400 text-xs">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <title>Flight</title>
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        <span className="font-mono">{distance} km</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Image Swiper Gallery - Show if travel has media */}
        {showImageSwiper &&
          selectedTravel &&
          selectedTravel.media &&
          selectedTravel.media.length > 0 && (
            <ImageSwiper
              cards={selectedTravel.media.map((item, index) => ({
                id: `${selectedTravel._id}-${index}`,
                imageUrl: item.url,
                title: selectedTravel.title,
                caption: item.caption,
              }))}
              onClose={handleImageSwiperClose}
              onViewFullStory={handleViewDetails}
              travelTitle={selectedTravel.title}
            />
          )}

        {/* Enhanced Popup Modal - Show if no media or swiper is hidden */}
        {selectedTravel && !showImageSwiper && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 p-4">
            <div className="fade-in zoom-in-95 pointer-events-auto w-full max-w-lg animate-in overflow-hidden rounded-2xl bg-white shadow-2xl duration-300">
              {/* Header with Gradient */}
              <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <button
                  aria-label="Close popup"
                  className="absolute top-4 right-4 rounded-lg bg-white/20 p-1.5 backdrop-blur-sm transition-all hover:bg-white/30"
                  onClick={handlePopupClose}
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>

                <h3 className="mb-3 pr-10 font-bold text-2xl">
                  {selectedTravel.title}
                </h3>

                {/* Tags */}
                {selectedTravel.tags && selectedTravel.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTravel.tags.map((tag) => (
                      <span
                        className="rounded-full bg-white/20 px-3 py-1 font-medium text-xs backdrop-blur-sm"
                        key={tag}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Location & Date */}
                <div className="mb-4 space-y-2 rounded-lg bg-gray-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-500 text-xs">
                        Location
                      </div>
                      <div className="mt-0.5 font-semibold text-gray-900 text-sm">
                        {selectedTravel.location.city},{" "}
                        {selectedTravel.location.state}
                      </div>
                      <div className="text-gray-600 text-xs">
                        {selectedTravel.location.country}
                      </div>
                    </div>
                  </div>

                  {selectedTravel.visitDate && (
                    <div className="flex items-start gap-3 border-gray-200 border-t pt-2">
                      <div className="rounded-full bg-blue-100 p-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-500 text-xs">
                          Visited
                        </div>
                        <div className="mt-0.5 font-semibold text-gray-900 text-sm">
                          {new Date(
                            selectedTravel.visitDate
                          ).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="mb-4 text-gray-700 text-sm leading-relaxed">
                  {selectedTravel.description}
                </p>

                {/* Media Count */}
                {selectedTravel.media && selectedTravel.media.length > 0 && (
                  <div className="mb-4 rounded-lg border-2 border-blue-100 bg-blue-50 p-3">
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <title>Media</title>
                        <path
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                      <span className="font-semibold text-blue-900 text-sm">
                        {selectedTravel.media.length} media item
                        {selectedTravel.media.length !== 1 ? "s" : ""} available
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 transition-all hover:bg-gray-50"
                    onClick={handlePopupClose}
                    type="button"
                  >
                    Close
                  </button>
                  <button
                    className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                    onClick={handleViewDetails}
                    type="button"
                  >
                    View Full Story →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <MiniMap
          camera3dProps={cameraProps}
          isOverlayActive={showImageSwiper}
          onMapClick={handleMapClick}
        />
      </div>
    </APIProvider>
  );
}
