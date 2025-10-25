"use client";

import { APIProvider, type MapMouseEvent } from "@vis.gl/react-google-maps";
import { useCallback, useState } from "react";
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

export function Map3DView() {
  const [cameraProps, setCameraProps] =
    useState<Map3DCameraProps>(INITIAL_CAMERA);

  const handleCameraChange = useCallback((props: Map3DCameraProps) => {
    setCameraProps({ ...props });
  }, []);

  const handleMapClick = useCallback((ev: MapMouseEvent) => {
    if (!ev.detail.latLng) return;

    const { lat, lng } = ev.detail.latLng;
    setCameraProps((p) => ({ ...p, center: { lat, lng, altitude: 0 } }));
  }, []);

  return (
    <APIProvider apiKey={API_KEY} version="beta">
      <div className="h-screen w-full">
        <Map3D
          {...cameraProps}
          defaultLabelsDisabled={false}
          onCameraChange={handleCameraChange}
        />
        <MiniMap camera3dProps={cameraProps} onMapClick={handleMapClick} />
      </div>
    </APIProvider>
  );
}
