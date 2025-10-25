import { AdvancedMarker } from "@vis.gl/react-google-maps";

type ViewCenterMarkerProps = { position: google.maps.LatLngAltitudeLiteral };
export const ViewCenterMarker = ({ position }: ViewCenterMarkerProps) => (
  <AdvancedMarker position={position} style={{ width: 0, height: 0 }}>
    <div className="-translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full border border-black bg-blue-500" />
  </AdvancedMarker>
);
