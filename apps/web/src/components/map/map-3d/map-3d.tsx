import { useMapsLibrary } from "@vis.gl/react-google-maps";
import {
  type ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useMap3DCameraEvents } from "./use-map-3d-camera-events";

import "./map-3d-types";
import { useCallbackRef, useDeepCompareEffect } from "@/lib/utility-hooks";

export type Map3DProps = google.maps.maps3d.Map3DElementOptions & {
  onCameraChange?: (cameraProps: Map3DCameraProps) => void;
  children?: React.ReactNode;
};

export type Map3DCameraProps = {
  center: google.maps.LatLngAltitudeLiteral;
  range: number;
  heading: number;
  tilt: number;
  roll: number;
};

export const Map3D = forwardRef(
  (
    props: Map3DProps,
    forwardedRef: ForwardedRef<google.maps.maps3d.Map3DElement | null>
  ) => {
    useMapsLibrary("maps3d");

    const [map3DElement, map3dRef] =
      useCallbackRef<google.maps.maps3d.Map3DElement>();

    useMap3DCameraEvents(map3DElement, (p) => {
      if (!props.onCameraChange) return;

      props.onCameraChange(p);
    });

    const [customElementsReady, setCustomElementsReady] = useState(false);
    useEffect(() => {
      customElements.whenDefined("gmp-map-3d").then(() => {
        setCustomElementsReady(true);
      });
    }, []);

    const { center, heading, tilt, range, roll, children, ...map3dOptions } =
      props;

    useDeepCompareEffect(() => {
      if (!map3DElement) return;

      // copy all values from map3dOptions to the map3D element itself
      Object.assign(map3DElement, map3dOptions);
    }, [map3DElement, map3dOptions]);

    useImperativeHandle<
      google.maps.maps3d.Map3DElement | null,
      google.maps.maps3d.Map3DElement | null
    >(forwardedRef, () => map3DElement, [map3DElement]);

    if (!customElementsReady) return null;

    return (
      <gmp-map-3d
        center={center}
        heading={props.heading}
        mode="HYBRID"
        range={props.range}
        ref={map3dRef}
        roll={props.roll}
        tilt={props.tilt}
      >
        {children}
      </gmp-map-3d>
    );
  }
);

Map3D.displayName = "Map3D";
