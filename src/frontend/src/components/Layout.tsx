import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/use-auth";
import { useDiscreetMode } from "@/hooks/use-safety";
import { Link, Outlet } from "@tanstack/react-router";
import { NotebookPen, ShieldCheck } from "lucide-react";
import { useEffect } from "react";

/**
 * App shell for authenticated users: a distinct header, the routed page body,
 * and the persistent bottom navigation with the central SOS button.
 *
 * When discreet mode is enabled, the header disguises the app as an innocuous
 * notes app so a glance at the screen doesn't reveal it's a safety app.
 */
export function Layout() {
  const { logout } = useAuth();
  const { data: discreet } = useDiscreetMode();

  const disguised = discreet === true;

  // Disguise the browser tab title too, so discreet mode hides the app's
  // identity everywhere it's visible.
  useEffect(() => {
    document.title = disguised ? "Notes" : "SafeHer";
  }, [disguised]);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card shadow-subtle">
        <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between px-4">
          <Link
            to="/"
            data-ocid="brand_link"
            className="flex items-center gap-2 font-display text-lg font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
              {disguised ? (
                <NotebookPen className="h-5 w-5" aria-hidden="true" />
              ) : (
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              )}
            </span>
            {disguised ? "Notes" : "SafeHer"}
          </Link>

          <button
            type="button"
            onClick={logout}
            data-ocid="logout_button"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {disguised ? "Close" : "Sign out"}
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-32 pt-6">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
