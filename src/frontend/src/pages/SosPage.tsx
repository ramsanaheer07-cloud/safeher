import { SosButton } from "@/components/SosButton";
import { Button } from "@/components/ui/button";
import { useContacts } from "@/hooks/use-contacts";
import {
  type SosAlert,
  getCurrentLocation,
  useTriggerSos,
} from "@/hooks/use-sos";
import { AlertTriangle, CheckCircle2, MapPin, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const COUNTDOWN_SECONDS = 5;

type SosStage = "idle" | "countdown" | "sent";

/**
 * Emergency SOS flow. One tap starts a countdown with a cancel option; when the
 * countdown completes the user's live location is captured and an alert is sent
 * to their trusted contacts. The red-orange SOS accent is used only here.
 */
export function SosPage() {
  const [stage, setStage] = useState<SosStage>("idle");
  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS);
  const [sentAlert, setSentAlert] = useState<SosAlert | null>(null);
  const [locationError, setLocationError] = useState(false);
  const firedRef = useRef(false);
  const triggerSos = useTriggerSos();
  const { data: contacts = [] } = useContacts();

  // Keep the latest mutate fn in a ref so the countdown effect never re-fires
  // when the mutation object identity changes between renders.
  const triggerRef = useRef(triggerSos.mutate);
  triggerRef.current = triggerSos.mutate;

  useEffect(() => {
    if (stage !== "countdown") {
      firedRef.current = false;
      return;
    }
    if (remaining > 0) {
      const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (firedRef.current) return;
    firedRef.current = true;

    let cancelled = false;
    (async () => {
      const location = await getCurrentLocation();
      if (cancelled) return;
      if (!location) setLocationError(true);
      triggerRef.current(location ?? { latitude: 0, longitude: 0 }, {
        onSuccess: (alert) => {
          setSentAlert(alert);
          setStage("sent");
        },
        onError: () => {
          toast.error("Couldn't send your SOS alert. Please try again.");
          setStage("idle");
          setRemaining(COUNTDOWN_SECONDS);
        },
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [stage, remaining]);

  const startCountdown = () => {
    setRemaining(COUNTDOWN_SECONDS);
    setLocationError(false);
    setStage("countdown");
  };

  const reset = () => {
    setStage("idle");
    setRemaining(COUNTDOWN_SECONDS);
    setSentAlert(null);
    setLocationError(false);
  };

  const alertedCount = sentAlert?.alertedContacts.length ?? 0;

  return (
    <div className="space-y-6" data-ocid="sos_page">
      <section className="animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Emergency SOS
        </h1>
        <p className="mt-1 text-muted-foreground">
          Reach your trusted contacts the moment you need them.
        </p>
      </section>

      {stage === "idle" ? (
        <section
          data-ocid="sos_idle"
          className="animate-fade-up flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-subtle"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Ready when you are
          </p>
          <div className="my-6">
            <SosButton size="large" />
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Tap SOS to start a short countdown. Your live location will be
            shared with your trusted contacts.
          </p>
          <Button
            type="button"
            onClick={startCountdown}
            data-ocid="sos_start_button"
            className="mt-6 w-full"
          >
            Start SOS
          </Button>
        </section>
      ) : null}

      {stage === "countdown" ? (
        <section
          data-ocid="sos_countdown"
          className="animate-fade-up flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-subtle"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-destructive">
            Alerting contacts
          </p>
          <p
            data-ocid="sos_countdown_value"
            className="my-4 font-display text-6xl font-bold text-destructive"
          >
            {remaining}
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Your trusted contacts will be alerted with your live location.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={reset}
            data-ocid="sos_cancel_button"
            className="mt-6 w-full"
          >
            Cancel
          </Button>
        </section>
      ) : null}

      {stage === "sent" ? (
        <section
          data-ocid="sos_sent"
          className="animate-fade-up flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-subtle"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display text-xl font-bold text-foreground">
            Your contacts have been alerted
          </h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            {alertedCount > 0
              ? `${alertedCount} trusted ${
                  alertedCount === 1 ? "contact" : "contacts"
                } received your alert with your live location. Help is on the way.`
              : "Your trusted contacts received your alert. Help is on the way."}
          </p>

          {locationError ? (
            <div
              data-ocid="sos_location_error"
              className="mt-4 flex w-full items-start gap-2 rounded-xl bg-warning/10 p-3 text-left"
            >
              <MapPin
                className="mt-0.5 h-4 w-4 shrink-0 text-warning"
                aria-hidden="true"
              />
              <p className="text-xs text-muted-foreground">
                We couldn't capture your live location, but your contacts were
                still alerted.
              </p>
            </div>
          ) : null}

          <Button
            type="button"
            variant="outline"
            onClick={reset}
            data-ocid="sos_done_button"
            className="mt-6 w-full"
          >
            Done
          </Button>
        </section>
      ) : null}

      <section
        data-ocid="sos_info"
        className="animate-fade-up flex items-start gap-3 rounded-2xl bg-muted/40 p-4"
      >
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <p className="text-sm text-muted-foreground">
          Only use SOS in a real emergency. Your location is shared only with
          the trusted contacts you have added.
        </p>
      </section>

      <section
        data-ocid="sos_contacts"
        className="animate-fade-up flex items-start gap-3 rounded-2xl bg-card p-4 shadow-subtle"
      >
        <ShieldCheck
          className="mt-0.5 h-5 w-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-semibold text-foreground">
            {contacts.length > 0
              ? `${contacts.length} trusted ${
                  contacts.length === 1 ? "contact" : "contacts"
                } ready`
              : "No trusted contacts yet"}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {contacts.length > 0
              ? "Your alert will be sent to everyone listed here."
              : "Add trusted contacts so they can be alerted in an emergency."}
          </p>
        </div>
      </section>
    </div>
  );
}
