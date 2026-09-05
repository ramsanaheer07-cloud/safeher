import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ShieldCheck } from "lucide-react";

/**
 * Welcome / login screen shown to unauthenticated users. Calm, reassuring,
 * and trustworthy — the first thing a new visitor sees.
 */
export function WelcomeScreen() {
  const { login, isLoggingIn, isLoginError, loginError } = useAuth();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full gradient-hero text-primary shadow-subtle">
          <ShieldCheck className="h-10 w-10" aria-hidden="true" />
        </div>

        <h1 className="font-display text-3xl font-bold text-foreground">
          SafeHer
        </h1>
        <p className="mt-2 font-display text-lg font-semibold text-primary">
          You&apos;re safe here.
        </p>
        <p className="mt-3 text-muted-foreground">
          A calm place to keep your trusted circle close, set a safety timer,
          and reach help the moment you need it.
        </p>

        <Button
          type="button"
          size="lg"
          className="mt-8 w-full"
          onClick={() => login()}
          disabled={isLoggingIn}
          data-ocid="login_button"
        >
          {isLoggingIn ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : null}
          {isLoggingIn ? "Signing in…" : "Sign in with Internet Identity"}
        </Button>

        {isLoginError ? (
          <p
            role="alert"
            data-ocid="login_error"
            className="mt-4 text-sm text-destructive"
          >
            {loginError?.message ?? "Something went wrong. Please try again."}
          </p>
        ) : null}

        <p className="mt-6 text-xs text-muted-foreground">
          Your data stays private to you. Sign in to add trusted contacts and
          start a safety timer.
        </p>
      </div>
    </div>
  );
}
