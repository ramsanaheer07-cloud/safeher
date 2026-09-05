import { WelcomeScreen } from "@/components/WelcomeScreen";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/use-auth";
import { router } from "@/lib/router";
import { RouterProvider } from "@tanstack/react-router";

/**
 * Root component. Gates the whole app behind Internet Identity: unauthenticated
 * users see the WelcomeScreen, authenticated users get the routed app shell.
 */
export default function App() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div
          data-ocid="loading_state"
          className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? <RouterProvider router={router} /> : <WelcomeScreen />}
      <Toaster position="top-center" />
    </>
  );
}
