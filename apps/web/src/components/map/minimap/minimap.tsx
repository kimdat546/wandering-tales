import { Map, type MapMouseEvent, useMap } from "@vis.gl/react-google-maps";
import { useMemo } from "react";
import { useDebouncedEffect } from "@/lib/utility-hooks";
import type { Map3DCameraProps } from "../map-3d";
import { CameraPositionMarker } from "./camera-position-marker";
import { estimateCameraPosition } from "./estimate-camera-position";
import { ViewCenterMarker } from "./view-center-marker";

type MiniMapProps = {
  camera3dProps: Map3DCameraProps;
  onMapClick?: (ev: MapMouseEvent) => void;
  isOverlayActive?: boolean;
};

export const MiniMap = ({
  camera3dProps,
  onMapClick,
  isOverlayActive = false,
}: MiniMapProps) => {
  const minimap = useMap("minimap");

  const cameraPosition = useMemo(
    () => estimateCameraPosition(camera3dProps),
    [camera3dProps]
  );

  useDebouncedEffect(
    () => {
      if (!minimap) {
        return;
      }

      const bounds = new google.maps.LatLngBounds();
      bounds.extend(camera3dProps.center);
      bounds.extend(cameraPosition);

      const maxZoom = Math.max(
        1,
        Math.round(24 - Math.log2(camera3dProps.range))
      );

      minimap.fitBounds(bounds, 120);
      minimap.setZoom(maxZoom);
    },
    200,
    [minimap, camera3dProps.center, camera3dProps.range, cameraPosition]
  );

  return (
    <div className="relative">
      {/* Wrapper for performance optimization */}
      <div
        className={`absolute right-6 bottom-6 aspect-square w-1/2 max-w-40 overflow-hidden rounded-xl shadow-[5px_2px_20px_rgba(0,0,0,0.6)] ${
          isOverlayActive ? "will-change-[filter]" : ""
        }`}
        style={
          isOverlayActive
            ? { filter: "grayscale(100%)", transition: "filter 0.15s ease-out" }
            : { transition: "filter 0.15s ease-out" }
        }
      >
        <Map
          className="h-full w-full"
          clickableIcons={false}
          defaultCenter={camera3dProps.center}
          defaultZoom={10}
          disableDefaultUI
          id="minimap"
          mapId="bf51a910020fa25a"
          onClick={onMapClick}
        >
          <ViewCenterMarker position={camera3dProps.center} />
          <CameraPositionMarker
            heading={camera3dProps.heading}
            position={cameraPosition}
          />
        </Map>
      </div>
      {/* Gray overlay for minimap - fast GPU-accelerated overlay */}
      <div
        className={`pointer-events-none absolute right-6 bottom-6 aspect-square w-1/2 max-w-80 overflow-hidden rounded-xl bg-black/40 transition-opacity duration-150 ease-out ${
          isOverlayActive ? "opacity-100" : "opacity-0"
        }`}
        style={{ willChange: isOverlayActive ? "opacity" : "auto" }}
      />
    </div>
  );
};
