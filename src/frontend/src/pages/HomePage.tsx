import { type MapPoint, MapView } from "@/components/MapView";
import { Card, CardContent } from "@/components/ui/card";
import { useGetLocation } from "@/hooks/use-timer";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Clock,
  LogIn,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

const quickActions = [
  {
    to: "/contacts",
    title: "Trusted Contacts",
    description: "Your circle of people you trust",
    icon: Users,
    dataOcid: "home_contacts_card",
  },
  {
    to: "/timer",
    title: "Safety Timer",
    description: "Share your location while you travel",
    icon: Clock,
    dataOcid: "home_timer_card",
  },
] as const;

/**
 * Home dashboard. A reassuring status banner, a live-location map that tracks
 * the user's position as it changes, and quick access to the core safety
 * tools. The SOS accent is reserved for the SOS button only.
 */
export function HomePage() {
  const { data: backendLocation } = useGetLocation();
  const [livePoint, setLivePoint] = useState<MapPoint | null>(null);

  // Track the user's live position so the map marker updates as they move.
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLivePoint({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyM: position.coords.accuracy,
        });
      },
      () => {
        // Fall back to the last backend snapshot when live tracking is denied.
        if (backendLocation) {
          setLivePoint({
            latitude: backendLocation.latitude,
            longitude: backendLocation.longitude,
            accuracyM: backendLocation.accuracyM,
          });
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [backendLocation]);

  const mapPoint: MapPoint | null =
    livePoint ??
    (backendLocation
      ? {
          latitude: backendLocation.latitude,
          longitude: backendLocation.longitude,
          accuracyM: backendLocation.accuracyM,
        }
      : null);

  return (
    <div className="space-y-6" data-ocid="home_page">
      <section className="animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Welcome back
        </h1>
        <p className="mt-1 text-muted-foreground">
          Your safety toolkit, all in one calm place.
        </p>
      </section>

      <section
        data-ocid="home_status_banner"
        className="gradient-hero animate-fade-up rounded-2xl p-6 shadow-subtle"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-primary shadow-subtle">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-foreground">
              You&apos;re safe here.
            </p>
            <p className="text-sm text-muted-foreground">
              Your trusted circle and safety tools are ready when you need them.
            </p>
          </div>
        </div>
      </section>

      {/* Live location map */}
      <section className="animate-fade-up">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="font-display text-lg font-bold text-foreground">
            Your location
          </h2>
          <span className="flex items-center gap-1 rounded-full bg-location/15 px-2.5 py-0.5 text-xs font-semibold text-location">
            <span className="checkin-status-dot" aria-hidden="true" />
            Live
          </span>
        </div>
        <MapView center={mapPoint} className="h-64" />
        {!mapPoint && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Allow location access to see your live position on the map.
          </p>
        )}
      </section>

      {/* Check-in quick action */}
      <Link
        to="/check-in"
        data-ocid="home_checkin_card"
        className="animate-fade-up flex items-center gap-4 rounded-2xl bg-card p-5 shadow-subtle transition-smooth hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-location/15 text-location">
          <LogIn className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base font-bold text-foreground">
            Check in
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Let your trusted circle know you&apos;ve arrived somewhere safe.
          </p>
        </div>
        <MapPin className="h-5 w-5 shrink-0 text-location" aria-hidden="true" />
      </Link>

      <section className="grid grid-cols-2 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              data-ocid={action.dataOcid}
              className="animate-fade-up rounded-2xl bg-card p-5 shadow-subtle transition-smooth hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-display text-base font-bold text-foreground">
                {action.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {action.description}
              </p>
            </Link>
          );
        })}
      </section>

      <Link
        to="/resources"
        data-ocid="home_resources_card"
        className="animate-fade-up flex items-center gap-4 rounded-2xl bg-card p-5 shadow-subtle transition-smooth hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ animationDelay: "0.3s" }}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
          <BookOpen className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-base font-bold text-foreground">
            Safety Resources
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Helplines, self-defense, travel and digital safety tips.
          </p>
        </div>
      </Link>
    </div>
  );
}
