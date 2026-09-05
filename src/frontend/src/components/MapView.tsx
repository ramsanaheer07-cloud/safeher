import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LocateFixed } from "lucide-react";
import { useEffect, useRef } from "react";

export interface MapPoint {
  latitude: number;
  longitude: number;
  accuracyM?: number;
}

interface MapViewProps {
  /** The point to show on the map. When null, the map stays empty. */
  center: MapPoint | null;
  /** Extra classes, e.g. a height utility like `h-64`. */
  className?: string;
  /** Show the floating center-on-me control. Defaults to true. */
  showCenterControl?: boolean;
  /** Allow pan/zoom interaction. Defaults to true. */
  interactive?: boolean;
}

/**
 * Embedded interactive map rendered from free, keyless OpenStreetMap tiles in
 * the browser (Leaflet). Shows the given point as a teal live-location marker
 * with an accuracy ring, and offers a center-on-me control. The location teal
 * accent is used throughout; the SOS red-orange stays reserved for emergency
 * actions.
 */
export function MapView({
  center,
  className,
  showCenterControl = true,
  interactive = true,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const accuracyRef = useRef<L.Circle | null>(null);

  // Initialise the map once on mount.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = L.map(container, {
      zoomControl: interactive,
      attributionControl: true,
      dragging: interactive,
      scrollWheelZoom: interactive,
      touchZoom: interactive,
      doubleClickZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Live-location marker. position:relative lets the ::after pulse ring
    // anchor to the marker itself rather than the map container.
    const icon = L.divIcon({
      className: "",
      html: '<div class="map-live-marker" style="position:relative"></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
    const marker = L.marker([0, 0], { icon, interactive: false }).addTo(map);
    markerRef.current = marker;

    // Accuracy ring, styled with the location teal via inline CSS variables.
    const accuracy = L.circle([0, 0], {
      radius: 0,
      className: "map-accuracy-ring",
      interactive: false,
    }).addTo(map);
    const accuracyPath = accuracy.getElement() as SVGPathElement | null;
    if (accuracyPath) {
      accuracyPath.style.stroke = "oklch(var(--location) / 0.45)";
      accuracyPath.style.strokeWidth = "1.5px";
      accuracyPath.style.strokeDasharray = "4 4";
      accuracyPath.style.fill = "oklch(var(--location) / 0.12)";
    }
    accuracyRef.current = accuracy;

    // Let the map measure its container after layout settles.
    const raf = requestAnimationFrame(() => map.invalidateSize());

    return () => {
      cancelAnimationFrame(raf);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      accuracyRef.current = null;
    };
  }, [interactive]);

  // Move the marker and accuracy ring when the center point changes.
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    const accuracy = accuracyRef.current;
    if (!map || !marker || !accuracy || !center) return;

    const latLng = L.latLng(center.latitude, center.longitude);
    marker.setLatLng(latLng);
    accuracy.setLatLng(latLng);
    accuracy.setRadius(center.accuracyM ?? 0);
  }, [center]);

  const handleCenterOnMe = () => {
    const map = mapRef.current;
    if (!map || !center) return;
    map.flyTo(
      L.latLng(center.latitude, center.longitude),
      Math.max(map.getZoom(), 15),
    );
  };

  return (
    <div className={`map-container relative ${className ?? ""}`}>
      <div
        ref={containerRef}
        data-ocid="map_canvas"
        className="h-full w-full"
        aria-label="Interactive map"
      />
      {showCenterControl && center && (
        <button
          type="button"
          onClick={handleCenterOnMe}
          data-ocid="map_center_button"
          aria-label="Center on my location"
          className="map-center-btn absolute bottom-3 right-3 z-[1000]"
        >
          <LocateFixed className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
