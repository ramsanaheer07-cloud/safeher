import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useDiscreetMode, useSetDiscreetMode } from "@/hooks/use-safety";
import { EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

/**
 * Discreet Mode. When enabled, the app disguises itself so it looks like
 * something innocuous — a calculator or notes app — rather than a safety app.
 * This helps avoid drawing attention in situations where being seen using a
 * safety app could feel risky. The page uses the calm, neutral discreet
 * palette throughout; the red-orange SOS accent stays reserved for emergency
 * actions.
 */
export function DiscreetModePage() {
  const { data: enabled, isLoading, isError } = useDiscreetMode();
  const setDiscreetMode = useSetDiscreetMode();

  const handleToggle = (checked: boolean) => {
    setDiscreetMode.mutate(checked, {
      onSuccess: () =>
        toast.success(
          checked
            ? "Discreet mode is on — your app now looks like a notes app"
            : "Discreet mode is off — your app looks like SafeHer again",
        ),
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <div className="space-y-6" data-ocid="discreet_page">
      <section className="animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Discreet Mode
        </h1>
        <p className="mt-1 text-muted-foreground">
          Keep your safety app private when you need to.
        </p>
      </section>

      {isLoading ? (
        <section
          data-ocid="loading_state"
          className="animate-fade-up flex flex-col items-center gap-4 rounded-2xl bg-card p-8 shadow-subtle"
        >
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-10 w-full" />
        </section>
      ) : isError ? (
        <section
          data-ocid="error_state"
          className="animate-fade-up rounded-2xl bg-card p-8 text-center shadow-subtle"
        >
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load your discreet mode setting. Please try again.
          </p>
        </section>
      ) : (
        <>
          <section
            data-ocid="discreet_toggle"
            className="animate-fade-up flex items-center gap-4 rounded-2xl bg-card p-6 shadow-subtle"
          >
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition-smooth ${
                enabled
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <EyeOff className="h-7 w-7" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-semibold text-foreground">
                Discreet Mode
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {enabled
                  ? "On — your app is disguised"
                  : "Off — your app looks like SafeHer"}
              </p>
            </div>
            <Switch
              checked={enabled ?? false}
              onCheckedChange={handleToggle}
              disabled={setDiscreetMode.isPending}
              aria-label="Toggle discreet mode"
              data-ocid="discreet_toggle_switch"
            />
          </section>

          <section
            data-ocid="discreet_explainer"
            className="animate-fade-up discreet-surface p-6"
          >
            <div className="flex items-start gap-3">
              <Sparkles
                className="mt-0.5 h-5 w-5 shrink-0 text-discreet-foreground"
                aria-hidden="true"
              />
              <div>
                <h2 className="font-display text-base font-semibold text-discreet-foreground">
                  What discreet mode does
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-discreet-foreground/80">
                  When it&apos;s on, SafeHer disguises itself so it looks like
                  something completely innocuous — like a calculator or a notes
                  app. That way, if someone glances at your screen, they
                  won&apos;t know you&apos;re using a safety app. You can switch
                  it back off any time you feel comfortable.
                </p>
              </div>
            </div>
          </section>

          <section
            data-ocid="discreet_tips"
            className="animate-fade-up flex items-start gap-3 rounded-2xl bg-muted/40 p-4"
          >
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              You&apos;re in control. Discreet mode is just one way SafeHer
              helps you feel safer — your trusted contacts, safety timer, and
              SOS button are always there when you need them.
            </p>
          </section>

          <section
            data-ocid="discreet_actions"
            className="animate-fade-up flex flex-col items-center rounded-2xl bg-card p-6 text-center shadow-subtle"
          >
            <p className="text-sm text-muted-foreground">
              {enabled
                ? "Ready to show your app again?"
                : "Want to hide your app for now?"}
            </p>
            <Button
              type="button"
              variant={enabled ? "secondary" : "default"}
              onClick={() => handleToggle(!enabled)}
              disabled={setDiscreetMode.isPending}
              data-ocid="discreet_toggle_button"
              className="mt-4 w-full"
            >
              {enabled ? "Turn discreet mode off" : "Turn discreet mode on"}
            </Button>
          </section>
        </>
      )}
    </div>
  );
}
