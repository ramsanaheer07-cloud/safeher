import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useFakeCall,
  useStartFakeCall,
  useStopFakeCall,
} from "@/hooks/use-safety";
import {
  Check,
  Phone,
  PhoneCall,
  PhoneOff,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/** The reassuring caller shown on the simulated incoming call. */
const CALLER_NAME = "Mom";

/**
 * Fake Call. Lets a girl trigger a simulated incoming call so she has a
 * believable reason to step away from an uncomfortable situation. While the
 * call is active a full-screen incoming-call overlay appears with a caller
 * name, accept/decline actions, and a ringing animation. The red-orange SOS
 * accent is reserved for emergencies, so this page stays in the calm primary
 * palette.
 */
export function FakeCallPage() {
  const { data: fakeCall, isLoading, isError } = useFakeCall();
  const startFakeCall = useStartFakeCall();
  const stopFakeCall = useStopFakeCall();

  // "connected" is a short local phase after the user accepts, before the
  // call is ended. The overlay itself is driven by the backend fake-call state.
  const [connected, setConnected] = useState(false);

  const active = fakeCall?.active === true;

  // If the backend call ends while we're showing the connected phase, reset.
  useEffect(() => {
    if (!active) setConnected(false);
  }, [active]);

  const handleStart = () => {
    startFakeCall.mutate(undefined, {
      onSuccess: () => toast.success("Incoming call started"),
      onError: (e) => toast.error(e.message),
    });
  };

  const handleAccept = () => {
    setConnected(true);
    toast.success(`Call connected — you're safe to step away`);
    // Let the "connected" moment breathe, then end the call.
    window.setTimeout(() => {
      stopFakeCall.mutate(undefined, {
        onError: (e) => toast.error(e.message),
      });
    }, 4000);
  };

  const handleDecline = () => {
    stopFakeCall.mutate(undefined, {
      onSuccess: () => toast.success("Fake call ended"),
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <div className="space-y-6" data-ocid="fake_call_page">
      <section className="animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Fake Call
        </h1>
        <p className="mt-1 text-muted-foreground">
          A believable incoming call, ready whenever you need an exit.
        </p>
      </section>

      {isLoading ? (
        <section
          data-ocid="loading_state"
          className="animate-fade-up flex flex-col items-center gap-4 rounded-2xl bg-card p-8 shadow-subtle"
        >
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-10 w-full" />
        </section>
      ) : isError ? (
        <section
          data-ocid="error_state"
          className="animate-fade-up rounded-2xl bg-card p-8 text-center shadow-subtle"
        >
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load the fake call. Please try again.
          </p>
        </section>
      ) : (
        <>
          <section
            data-ocid="fake_call_setup"
            className="animate-fade-up flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-subtle"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Phone className="h-7 w-7" aria-hidden="true" />
            </span>

            <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Your exit, on demand
            </p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Tap start and a call from {CALLER_NAME} will ring on your screen.
              It&apos;s the perfect reason to step away from an uncomfortable
              situation — no one will know it isn&apos;t real.
            </p>

            <Button
              type="button"
              onClick={handleStart}
              disabled={startFakeCall.isPending}
              data-ocid="fake_call_start_button"
              className="mt-6 w-full"
            >
              <PhoneCall className="h-4 w-4" aria-hidden="true" /> Start fake
              call
            </Button>
          </section>

          <section
            data-ocid="fake_call_info"
            className="animate-fade-up flex items-start gap-3 rounded-2xl bg-muted/40 p-4"
          >
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              The call looks and sounds real to anyone nearby. You can decline
              it at any time, or let it ring while you make your exit.
            </p>
          </section>
        </>
      )}

      {active ? (
        <dialog
          open
          data-ocid="fake_call_overlay"
          className="fake-call-overlay fixed inset-0 z-50 m-0 flex flex-col items-center justify-between border-0 bg-transparent px-6 py-16 text-white"
          aria-modal="true"
          aria-label="Incoming call"
        >
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <span
                aria-hidden="true"
                className="absolute inset-0 animate-ping rounded-full bg-white/25"
              />
              <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/15 text-4xl font-bold text-white ring-2 ring-white/40">
                {CALLER_NAME.charAt(0)}
              </span>
            </div>

            <p
              data-ocid="fake_call_caller"
              className="mt-6 font-display text-3xl font-bold"
            >
              {CALLER_NAME}
            </p>
            <p
              data-ocid="fake_call_status"
              className="mt-1 animate-pulse text-sm font-medium uppercase tracking-widest text-white/80"
            >
              {connected ? "Connected" : "Incoming call..."}
            </p>
          </div>

          <div className="flex w-full items-center justify-center gap-6">
            <button
              type="button"
              onClick={handleDecline}
              disabled={stopFakeCall.isPending}
              data-ocid="fake_call_decline_button"
              aria-label="Decline call"
              className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-full bg-white/15 text-white transition-smooth hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <PhoneOff className="h-6 w-6" aria-hidden="true" />
              <span className="text-[10px] font-semibold">Decline</span>
            </button>

            <button
              type="button"
              onClick={handleAccept}
              disabled={connected}
              data-ocid="fake_call_accept_button"
              aria-label="Accept call"
              className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-full bg-success text-white transition-smooth hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
            >
              <Check className="h-6 w-6" aria-hidden="true" />
              <span className="text-[10px] font-semibold">Accept</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleDecline}
            disabled={stopFakeCall.isPending}
            data-ocid="fake_call_stop_button"
            className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition-smooth hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-4 w-4" aria-hidden="true" /> End fake call
          </button>
        </dialog>
      ) : null}
    </div>
  );
}
