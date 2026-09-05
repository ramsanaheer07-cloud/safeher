import { type MapPoint, MapView } from "@/components/MapView";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCheckInHistory,
  useCheckInHistoryFor,
  useCheckInState,
  usePerformCheckIn,
  usePerformCheckOut,
} from "@/hooks/use-checkin";
import { useContacts } from "@/hooks/use-contacts";
import { getCurrentLocation, timestampToDate } from "@/hooks/use-timer";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronDown,
  LogIn,
  LogOut,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatCoords(point: MapPoint): string {
  return `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`;
}

/**
 * Standalone check-in / check-out screen. The user taps Check in on arrival to
 * record their current location and time, and Check out on departure. The
 * active state card shows whether they are checked in or out with the elapsed
 * time since check-in, and the history list shows where and when each event
 * happened, with each entry expanding into a map view of that location. The
 * location teal accent is used throughout; the SOS red-orange stays reserved
 * for emergency actions.
 */
export function CheckInPage() {
  const { data: state, isLoading, isError } = useCheckInState();
  const { data: history = [] } = useCheckInHistory();
  const checkIn = usePerformCheckIn();
  const checkOut = usePerformCheckOut();

  const { data: contacts = [] } = useContacts();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null,
  );
  const selectedContact = contacts.find(
    (c) => c.id.toString() === selectedContactId,
  );
  const { data: contactHistory = [], isLoading: contactHistoryLoading } =
    useCheckInHistoryFor(selectedContact?.principal);

  const [now, setNow] = useState(() => Date.now());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedContactId, setExpandedContactId] = useState<string | null>(
    null,
  );

  const checkedIn = state != null;

  // Tick every second so the elapsed time stays live while checked in.
  useEffect(() => {
    if (!checkedIn) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [checkedIn]);

  const checkedInAt = state ? timestampToDate(state.checkedInAtNs) : null;
  const elapsedMs = state ? now - Number(state.checkedInAtNs / 1_000_000n) : 0;

  const currentPoint: MapPoint | null = state
    ? {
        latitude: state.location.latitude,
        longitude: state.location.longitude,
        accuracyM: state.location.accuracyM,
      }
    : null;

  const handleCheckIn = async () => {
    try {
      const location = await getCurrentLocation();
      checkIn.mutate(location, {
        onSuccess: () =>
          toast.success(
            "You're checked in. Your location and time were saved.",
          ),
        onError: (e) => toast.error(e.message),
      });
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not get your location",
      );
    }
  };

  const handleCheckOut = async () => {
    try {
      const location = await getCurrentLocation();
      checkOut.mutate(location, {
        onSuccess: () =>
          toast.success("Checked out. Thanks for letting us know you're safe."),
        onError: (e) => toast.error(e.message),
      });
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not get your location",
      );
    }
  };

  return (
    <div className="space-y-6" data-ocid="checkin_page">
      <section className="animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Check in
        </h1>
        <p className="mt-1 text-muted-foreground">
          Let your trusted circle know you&apos;ve arrived somewhere safe.
        </p>
      </section>

      {isLoading ? (
        <section
          data-ocid="loading_state"
          className="animate-fade-up flex flex-col gap-4 rounded-2xl bg-card p-6 shadow-subtle"
        >
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </section>
      ) : isError ? (
        <section
          data-ocid="error_state"
          className="animate-fade-up rounded-2xl bg-card p-8 text-center shadow-subtle"
        >
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load your check-in status. Please try again.
          </p>
        </section>
      ) : (
        <>
          {/* Current location map */}
          <section className="animate-fade-up">
            <MapView center={currentPoint} className="h-56" />
            {!currentPoint && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Check in to see your location on the map.
              </p>
            )}
          </section>

          {/* Active state card */}
          <section
            data-ocid="checkin_state_card"
            className={cn(
              "animate-fade-up p-6",
              checkedIn ? "checkin-card-active" : "checkin-card-idle",
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "checkin-status-dot",
                  !checkedIn && "checkin-status-dot--idle",
                )}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-bold">
                  {checkedIn ? "Checked in" : "Checked out"}
                </p>
                <p className="text-sm opacity-80">
                  {checkedIn
                    ? `Checked in for ${formatElapsed(elapsedMs)}`
                    : "You're not currently checked in"}
                </p>
              </div>
            </div>

            {checkedIn && checkedInAt && (
              <p className="mt-3 flex items-center gap-1.5 text-sm opacity-80">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Since{" "}
                {checkedInAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}

            <Button
              type="button"
              onClick={checkedIn ? handleCheckOut : handleCheckIn}
              disabled={checkedIn ? checkOut.isPending : checkIn.isPending}
              data-ocid={checkedIn ? "checkout_button" : "checkin_button"}
              className={cn(
                "mt-5 w-full",
                checkedIn &&
                  "bg-location text-location-foreground hover:bg-location/90",
              )}
            >
              {checkedIn ? (
                <>
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                  {checkOut.isPending ? "Checking out…" : "Check out"}
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" aria-hidden="true" />
                  {checkIn.isPending ? "Checking in…" : "Check in"}
                </>
              )}
            </Button>
          </section>

          {/* History */}
          <section className="animate-fade-up">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-foreground">
                Recent activity
              </h2>
            </div>

            {history.length === 0 ? (
              <div
                data-ocid="empty_state"
                className="flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-subtle"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-location/15 text-location">
                  <MapPin className="h-6 w-6" aria-hidden="true" />
                </span>
                <p className="mt-3 font-display font-bold text-foreground">
                  No check-ins yet
                </p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  When you check in or out, your location and time will show up
                  here.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {history.map((entry, index) => {
                  const isIn = entry.kind === "checkIn";
                  const date = timestampToDate(entry.timestamp);
                  const point: MapPoint = {
                    latitude: entry.location.latitude,
                    longitude: entry.location.longitude,
                    accuracyM: entry.location.accuracyM,
                  };
                  const id = entry.id.toString();
                  const expanded = expandedId === id;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => setExpandedId(expanded ? null : id)}
                        data-ocid={`history_entry_${index}`}
                        aria-expanded={expanded}
                        className={cn(
                          "history-entry w-full text-left",
                          !isIn && "history-entry--out",
                        )}
                      >
                        <span className="history-entry-marker">
                          {isIn ? (
                            <LogIn className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <LogOut className="h-4 w-4" aria-hidden="true" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {isIn ? "Checked in" : "Checked out"}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {formatCoords(point)}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {date
                              ? date.toLocaleString([], {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Time unavailable"}
                          </span>
                        </span>
                        <span className="history-entry-link flex items-center gap-1 text-xs">
                          View map
                          <ChevronDown
                            className={cn(
                              "h-3.5 w-3.5 transition-transform",
                              expanded && "rotate-180",
                            )}
                            aria-hidden="true"
                          />
                        </span>
                      </button>
                      {expanded && (
                        <div className="mt-2">
                          <MapView
                            center={point}
                            className="h-48"
                            showCenterControl={false}
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Trusted contact history */}
          <section className="animate-fade-up">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-foreground">
                Trusted contacts&apos; activity
              </h2>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              Select one of your trusted contacts to see where and when they
              checked in or out.
            </p>

            <Select
              value={selectedContactId ?? ""}
              onValueChange={(value) => {
                setSelectedContactId(value || null);
                setExpandedContactId(null);
              }}
            >
              <SelectTrigger
                data-ocid="contact_history_select"
                className="w-full"
              >
                <SelectValue placeholder="Choose a trusted contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem
                    key={contact.id.toString()}
                    value={contact.id.toString()}
                  >
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedContact && (
              <div className="mt-4">
                {contactHistoryLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : contactHistory.length === 0 ? (
                  <div
                    data-ocid="contact_history_empty"
                    className="flex flex-col items-center rounded-2xl bg-card p-6 text-center shadow-subtle"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-location/15 text-location">
                      <Users className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <p className="mt-3 font-display font-bold text-foreground">
                      No activity yet
                    </p>
                    <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                      {selectedContact.name} hasn&apos;t checked in or out yet.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {contactHistory.map((entry, index) => {
                      const isIn = entry.kind === "checkIn";
                      const date = timestampToDate(entry.timestamp);
                      const point: MapPoint = {
                        latitude: entry.location.latitude,
                        longitude: entry.location.longitude,
                        accuracyM: entry.location.accuracyM,
                      };
                      const id = entry.id.toString();
                      const expanded = expandedContactId === id;
                      return (
                        <li key={id}>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedContactId(expanded ? null : id)
                            }
                            data-ocid={`contact_history_entry_${index}`}
                            aria-expanded={expanded}
                            className={cn(
                              "history-entry w-full text-left",
                              !isIn && "history-entry--out",
                            )}
                          >
                            <span className="history-entry-marker">
                              {isIn ? (
                                <LogIn className="h-4 w-4" aria-hidden="true" />
                              ) : (
                                <LogOut
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-foreground">
                                {isIn ? "Checked in" : "Checked out"}
                              </span>
                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                {formatCoords(point)}
                              </span>
                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                {date
                                  ? date.toLocaleString([], {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "Time unavailable"}
                              </span>
                            </span>
                            <span className="history-entry-link flex items-center gap-1 text-xs">
                              View map
                              <ChevronDown
                                className={cn(
                                  "h-3.5 w-3.5 transition-transform",
                                  expanded && "rotate-180",
                                )}
                                aria-hidden="true"
                              />
                            </span>
                          </button>
                          {expanded && (
                            <div className="mt-2">
                              <MapView
                                center={point}
                                className="h-48"
                                showCenterControl={false}
                              />
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </section>

          <section
            data-ocid="checkin_info"
            className="animate-fade-up flex items-start gap-3 rounded-2xl bg-muted/40 p-4"
          >
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-location"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              Checking in is a gentle way to keep your trusted circle in the
              loop. Your location and time are saved so you can look back on
              where you&apos;ve been.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
