import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useCheckInReminder,
  useCheckInReminderStatus,
  useMarkCheckIn,
  useSetCheckInReminder,
} from "@/hooks/use-safety";
import { getCurrentLocation, useTriggerSos } from "@/hooks/use-sos";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  BellRing,
  CheckCircle2,
  LogIn,
  MapPin,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const INTERVALS_MIN = [
  { label: "Every 30 min", minutes: 30 },
  { label: "Every hour", minutes: 60 },
  { label: "Every 2 hours", minutes: 120 },
] as const;

/**
 * Safety Tools hub focused on auto safety check-in reminders. The user can
 * turn on automatic check-in reminders and choose how often they fire. The
 * page polls the live reminder status; when a check-in is missed (overdue),
 * trusted contacts are notified through the SOS alert mechanism and the
 * overdue state is cleared. The calm primary palette is used throughout — the
 * red-orange SOS accent stays reserved for emergency actions.
 */
export function SafetyToolsPage() {
  const { data: reminder, isLoading, isError } = useCheckInReminder();
  const { data: status } = useCheckInReminderStatus();
  const setReminder = useSetCheckInReminder();
  const markCheckIn = useMarkCheckIn();
  const triggerSos = useTriggerSos();

  const currentMin = reminder ? Number(reminder.intervalSec / 60n) : 30;
  const [minutes, setMinutes] = useState<number>(currentMin);

  const enabled = reminder?.enabled ?? false;
  const overdue = status?.overdue ?? false;

  // Track the overdue episode we've already notified contacts about so a
  // single missed check-in only notifies once, not on every poll.
  const notifiedRef = useRef<bigint | null>(null);

  useEffect(() => {
    if (!status?.overdue) {
      notifiedRef.current = null;
      return;
    }
    if (notifiedRef.current === status.overdueSince) return;

    void (async () => {
      const location = (await getCurrentLocation()) ?? {
        latitude: 0,
        longitude: 0,
      };
      triggerSos.mutate(location, {
        onSuccess: () => {
          notifiedRef.current = status.overdueSince;
          toast.warning(
            "A check-in was missed. Your trusted contacts have been notified.",
          );
          markCheckIn.mutate();
        },
        onError: () => {
          toast.error(
            "We couldn't notify your contacts. Please check in manually.",
          );
        },
      });
    })();
  }, [status, triggerSos, markCheckIn]);

  const handleToggle = (checked: boolean) => {
    // The backend only supports turning reminders on (setCheckInReminder always
    // enables them), so the switch can only move from off to on. When it is
    // already on, the switch is disabled and reminders stay active.
    if (!checked) return;
    setReminder.mutate(BigInt(minutes) * 60n, {
      onSuccess: () => toast.success("Automatic check-in reminders turned on"),
      onError: (e) => toast.error(e.message),
    });
  };

  const handleInterval = (next: number) => {
    setMinutes(next);
    setReminder.mutate(BigInt(next) * 60n, {
      onSuccess: () =>
        toast.success(
          `Check-in reminders set for every ${
            next >= 60
              ? `${next / 60} hour${next > 60 ? "s" : ""}`
              : `${next} minutes`
          }`,
        ),
      onError: (e) => toast.error(e.message),
    });
  };

  const handleCheckInNow = () => {
    markCheckIn.mutate(undefined, {
      onSuccess: () => toast.success("Check-in recorded. You're all set."),
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <div className="space-y-6" data-ocid="safety_tools_page">
      <section className="animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Safety Tools
        </h1>
        <p className="mt-1 text-muted-foreground">
          Automatic check-in reminders that keep your trusted circle in the
          loop.
        </p>
      </section>

      {isLoading ? (
        <section
          data-ocid="loading_state"
          className="animate-fade-up flex flex-col gap-4 rounded-2xl bg-card p-6 shadow-subtle"
        >
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </section>
      ) : isError ? (
        <section
          data-ocid="error_state"
          className="animate-fade-up rounded-2xl bg-card p-8 text-center shadow-subtle"
        >
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load your check-in reminders. Please try again.
          </p>
        </section>
      ) : (
        <>
          {overdue && (
            <section
              data-ocid="checkin_overdue_banner"
              className="animate-fade-up flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4"
            >
              <TriangleAlert
                className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">
                  A check-in was missed
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your trusted contacts have been notified so they can reach
                  out. Check in now to confirm you&apos;re safe.
                </p>
                <Button
                  type="button"
                  onClick={handleCheckInNow}
                  disabled={markCheckIn.isPending}
                  data-ocid="checkin_now_button"
                  className="mt-3"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  {markCheckIn.isPending ? "Checking in…" : "Check in now"}
                </Button>
              </div>
            </section>
          )}

          <section
            data-ocid="checkin_card"
            className="animate-fade-up rounded-2xl bg-card p-6 shadow-subtle"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <BellRing className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Auto check-in reminders
                  </h2>
                  <Switch
                    checked={enabled}
                    onCheckedChange={handleToggle}
                    disabled={setReminder.isPending || enabled}
                    aria-label="Automatic check-in reminders"
                    data-ocid="checkin_toggle"
                  />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  If you don&apos;t check in by the time your reminder fires,
                  your trusted contacts are notified so they can reach out.
                </p>
                {enabled && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Reminders stay on once enabled. You can change how often
                    they fire below.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-foreground">
                How often should we check in?
              </p>
              <fieldset className="mt-3 grid grid-cols-3 gap-2">
                <legend className="sr-only">Check-in interval</legend>
                {INTERVALS_MIN.map((option) => (
                  <button
                    key={option.minutes}
                    type="button"
                    onClick={() => handleInterval(option.minutes)}
                    disabled={setReminder.isPending}
                    data-ocid={`checkin_interval_${option.minutes}`}
                    aria-pressed={minutes === option.minutes}
                    className={cn(
                      "rounded-xl border px-2 py-3 text-sm font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                      minutes === option.minutes
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-background text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </fieldset>
            </div>

            <Button
              type="button"
              onClick={() => handleInterval(minutes)}
              disabled={setReminder.isPending}
              data-ocid="checkin_save_button"
              className="mt-6 w-full"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              {enabled ? "Update reminder" : "Turn on reminders"}
            </Button>
          </section>

          <Link
            to="/check-in"
            data-ocid="checkin_standalone_card"
            className="animate-fade-up flex items-center gap-4 rounded-2xl bg-card p-5 shadow-subtle transition-smooth hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-location/15 text-location">
              <LogIn className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-base font-bold text-foreground">
                Check in / check out
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Record where you are when you arrive and leave, and see your
                check-in history.
              </p>
            </div>
            <MapPin
              className="h-5 w-5 shrink-0 text-location"
              aria-hidden="true"
            />
          </Link>

          <section
            data-ocid="checkin_info"
            className="animate-fade-up flex items-start gap-3 rounded-2xl bg-muted/40 p-4"
          >
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              Check-in reminders are a gentle safety net. You stay in control —
              you can change how often they fire, and your contacts are only
              notified if you don&apos;t check in.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
