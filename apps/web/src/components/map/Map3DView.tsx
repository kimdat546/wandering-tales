"use client";

import { APIProvider, type MapMouseEvent } from "@vis.gl/react-google-maps";
import { api } from "@wandering-tales/backend/convex/_generated/api";
import { type Id } from "@wandering-tales/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Calendar, MapPin, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Map3D, type Map3DCameraProps } from "./map-3d";
import { Marker3D } from "./Marker3D";
import { MiniMap } from "./minimap";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;

const INITIAL_CAMERA: Map3DCameraProps = {
  center: { lat: 20.5937, lng: 78.9629, altitude: 0 }, // India center
  range: 5_000_000,
  heading: 0,
  tilt: 45,
  roll: 0,
};

export function Map3DView() {
  const router = useRouter();
  const [cameraProps, setCameraProps] =
    useState<Map3DCameraProps>(INITIAL_CAMERA);
  const [selectedTravelId, setSelectedTravelId] =
    useState<Id<"travels"> | null>(null);

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

      // Fly camera to location with animation
      setCameraProps((prev) => ({
        ...prev,
        center: { lat: location.lat, lng: location.lng, altitude: 0 },
        range: 500_000, // Zoom in closer
        tilt: 60,
      }));
    },
    []
  );

  const handleSidebarItemClick = useCallback(
    (location: { lat: number; lng: number }) => {
      // Only fly camera, don't show popup
      setCameraProps((prev) => ({
        ...prev,
        center: { lat: location.lat, lng: location.lng, altitude: 0 },
        range: 500_000, // Zoom in closer
        tilt: 60,
      }));
    },
    []
  );

  const handlePopupClose = useCallback(() => {
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
      router.push(`/travel/${selectedTravelId}`);
    }
  }, [selectedTravelId, router]);

  return (
    <APIProvider apiKey={API_KEY} version="beta">
      <div className="relative h-screen w-full">
        <Map3D
          {...cameraProps}
          defaultLabelsDisabled={false}
          onCameraChange={handleCameraChange}
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

        {/* Enhanced Sidebar */}
        {travels && travels.length > 0 && (
          <div className="pointer-events-none absolute inset-0">
            <div className="pointer-events-auto absolute top-4 left-4 max-h-[calc(100vh-2rem)] w-80 overflow-hidden rounded-xl bg-white/95 shadow-2xl backdrop-blur-md">
              {/* Header */}
              <div className="border-gray-200 border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-gray-900 text-lg">
                    Travel Locations
                  </h2>
                  <span className="rounded-full bg-blue-600 px-2.5 py-1 font-semibold text-white text-xs">
                    {travels.length}
                  </span>
                </div>
                <p className="mt-1 text-gray-600 text-xs">
                  Click to explore each destination
                </p>
              </div>

              {/* Scrollable List */}
              <div className="max-h-[calc(100vh-10rem)] overflow-y-auto p-3">
                <div className="space-y-2">
                  {travels.map((travel) => (
                    <button
                      className={`group relative w-full overflow-hidden rounded-lg border p-3 text-left transition-all duration-200 ${
                        selectedTravelId === travel._id
                          ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg ring-2 ring-blue-500 ring-offset-2"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                      }`}
                      key={travel._id}
                      onClick={() =>
                        handleSidebarItemClick({
                          lat: travel.location.lat,
                          lng: travel.location.lng,
                        })
                      }
                      type="button"
                    >
                      {/* Left accent bar */}
                      <div
                        className={`absolute top-0 left-0 h-full w-1 transition-all ${
                          selectedTravelId === travel._id
                            ? "bg-blue-600"
                            : "bg-transparent group-hover:bg-blue-400"
                        }`}
                      />

                      <div className="ml-2">
                        <div className="mb-1 font-semibold text-gray-900">
                          {travel.title}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 text-xs">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {travel.location.city}, {travel.location.state}
                          </span>
                        </div>
                        {travel.visitDate && (
                          <div className="mt-1 flex items-center gap-1 text-gray-500 text-xs">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span>
                              {new Date(travel.visitDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Active indicator */}
                      {selectedTravelId === travel._id && (
                        <div className="-translate-y-1/2 absolute top-1/2 right-3">
                          <div className="relative flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Popup Modal */}
        {selectedTravel && (
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

        <MiniMap camera3dProps={cameraProps} onMapClick={handleMapClick} />
      </div>
    </APIProvider>
  );
}
