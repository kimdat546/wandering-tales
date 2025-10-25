import { AdvancedMarker } from "@vis.gl/react-google-maps";

type CameraPositionMarkerProps = {
  position: google.maps.LatLngAltitudeLiteral;
  heading: number;
};

export const CameraPositionMarker = ({
  position,
  heading,
}: CameraPositionMarkerProps) => (
  <AdvancedMarker position={position} style={{ width: 0, height: 0 }}>
    <svg
      className="-translate-x-1/2 -translate-y-1/2 origin-[50%_0]"
      height={20}
      style={{
        transform: `rotate(${heading}deg)`,
        transformOrigin: "50% 0",
      }}
      viewBox="-1 -1 2 2"
      width={20}
    >
      <title>Camera Position</title>
      <path
        className="fill-red-500 stroke-2 stroke-black"
        d="M0,-1L-.5,1L.5,1z"
        style={{ vectorEffect: "non-scaling-stroke" }}
      />
    </svg>
  </AdvancedMarker>
);
