import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getCurrentLocation,
  timestampToDate,
  useCheckIn,
  useExtendTimer,
  useStartTimer,
  useStopTimer,
  useTimer,
} from "@/hooks/use-timer";
import { cn } from "@/lib/utils";
import { Clock, MapPin, Play, Plus, ShieldCheck, Square } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const PRESETS_MIN = [15, 30, 45, 60];
const EXTEND_MIN = 15;

function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
      sec,
    ).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/**
 * Safety Timer. The user picks a duration and starts a timer; while it is
 * active the app shares their live location with trusted contacts via check-in.
 * The user can check in, extend, or stop the timer early. The red-orange SOS
 * accent is reserved for emergency actions, so this page uses the calm primary
 * palette throughout.
 */
export function TimerPage() {
  const { data: timer, isLoading, isError } = useTimer();
  const startTimer = useStartTimer();
  const checkIn = useCheckIn();
  const extendTimer = useExtendTimer();
  const stopTimer = useStopTimer();

  const [minutes, setMinutes] = useState(30);
  const [now, setNow] = useState(() => Date.now());

  const active = timer?.status === "active";

  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);

  let remainingSec = 0;
  if (timer && active) {
    const endNs = timer.startedAtNs + timer.durationSec * 1_000_000_000n;
    const nowNs = BigInt(now) * 1_000_000n;
    remainingSec = Math.floor(Number((endNs - nowNs) / 1_000_000_000n));
  }
  const expired = active && remainingSec <= 0;

  const startedAt = timer ? timestampToDate(timer.startedAtNs) : null;
  const lastCheckIn = timer ? timestampToDate(timer.lastCheckInAtNs) : null;

  const handleStart = () => {
    startTimer.mutate(BigInt(minutes) * 60n, {
      onSuccess: () => toast.success("Safety timer started"),
      onError: (e) => toast.error(e.message),
    });
  };

  const handleCheckIn = async () => {
    try {
      const location = await getCurrentLocation();
      checkIn.mutate(location, {
        onSuccess: () =>
          toast.success("Your live location was shared with your contacts"),
        onError: (e) => toast.error(e.message),
      });
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not get your location",
      );
    }
  };

  const handleExtend = () => {
    extendTimer.mutate(BigInt(EXTEND_MIN) * 60n, {
      onSuccess: () => toast.success(`Timer extended by ${EXTEND_MIN} minutes`),
      onError: (e) => toast.error(e.message),
    });
  };

  const handleStop = () => {
    stopTimer.mutate(undefined, {
      onSuccess: () => toast.success("Safety timer stopped"),
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <div className="space-y-6" data-ocid="timer_page">
      <section className="animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Safety Timer
        </h1>
        <p className="mt-1 text-muted-foreground">
          Set a timer for your journey and share your location while it runs.
        </p>
      </section>

      {isLoading ? (
        <section
          data-ocid="loading_state"
          className="animate-fade-up flex flex-col items-center gap-4 rounded-2xl bg-card p-8 shadow-subtle"
        >
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </section>
      ) : isError ? (
        <section
          data-ocid="error_state"
          className="animate-fade-up rounded-2xl bg-card p-8 text-center shadow-subtle"
        >
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load your safety timer. Please try again.
          </p>
        </section>
      ) : active ? (
        <section
          data-ocid="timer_active"
          className="animate-fade-up flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-subtle"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Clock className="h-7 w-7" aria-hidden="true" />
          </span>

          <p
            role="timer"
            aria-live="polite"
            data-ocid="timer_display"
            className="my-4 font-display text-5xl font-bold tabular-nums text-foreground"
          >
            {formatDuration(remainingSec)}
          </p>

          <p
            data-ocid="timer_status"
            className="text-sm font-semibold uppercase tracking-widest text-primary"
          >
            {expired ? "Timer complete" : "Active — sharing location"}
          </p>

          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            {startedAt ? (
              <p>
                Started{" "}
                {startedAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            ) : null}
            {lastCheckIn ? (
              <p className="flex items-center justify-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                Last check-in{" "}
                {lastCheckIn.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            ) : null}
          </div>

          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCheckIn}
              disabled={checkIn.isPending}
              data-ocid="timer_checkin_button"
            >
              <MapPin className="h-4 w-4" aria-hidden="true" /> Check in
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleExtend}
              disabled={extendTimer.isPending}
              data-ocid="timer_extend_button"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> +{EXTEND_MIN} min
            </Button>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={handleStop}
            disabled={stopTimer.isPending}
            data-ocid="timer_stop_button"
            className="mt-3 w-full"
          >
            <Square className="h-4 w-4" aria-hidden="true" /> Stop timer
          </Button>
        </section>
      ) : (
        <section
          data-ocid="timer_setup"
          className="animate-fade-up flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-subtle"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Clock className="h-7 w-7" aria-hidden="true" />
          </span>

          <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Ready when you are
          </p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Choose how long you&apos;ll be travelling. Your live location will
            be shared with your trusted contacts while the timer runs.
          </p>

          <fieldset className="mt-6 grid w-full grid-cols-4 gap-2">
            <legend className="sr-only">Duration</legend>
            {PRESETS_MIN.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setMinutes(preset)}
                data-ocid={`timer_preset_${preset}`}
                aria-pressed={minutes === preset}
                className={cn(
                  "rounded-xl border px-2 py-2 text-sm font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  minutes === preset
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {preset}m
              </button>
            ))}
          </fieldset>

          <label
            htmlFor="timer-minutes"
            className="mt-4 text-sm text-muted-foreground"
          >
            Custom minutes
          </label>
          <input
            id="timer-minutes"
            type="number"
            min={1}
            max={240}
            value={minutes}
            onChange={(e) =>
              setMinutes(
                Math.min(240, Math.max(1, Number(e.target.value) || 1)),
              )
            }
            data-ocid="timer_minutes_input"
            className="mt-1 h-10 w-24 rounded-md border border-input bg-background px-3 text-center text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          <Button
            type="button"
            onClick={handleStart}
            disabled={startTimer.isPending}
            data-ocid="timer_start_button"
            className="mt-6 w-full"
          >
            <Play className="h-4 w-4" aria-hidden="true" /> Start timer
          </Button>
        </section>
      )}

      <section
        data-ocid="timer_info"
        className="animate-fade-up flex items-start gap-3 rounded-2xl bg-muted/40 p-4"
      >
        <ShieldCheck
          className="mt-0.5 h-5 w-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <p className="text-sm text-muted-foreground">
          While your timer is active, your live location is shared with your
          trusted contacts so they know you&apos;re safe. Check in any time to
          update your location.
        </p>
      </section>
    </div>
  );
}
