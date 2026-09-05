import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

interface SosButtonProps {
  className?: string;
  size?: "nav" | "large";
}

/**
 * The single emergency trigger for the app. The red-orange SOS accent is
 * reserved exclusively for this action so it stays prominent against the calm
 * rose/lilac palette. Rendered as a persistent, always-reachable control.
 */
export function SosButton({ className, size = "nav" }: SosButtonProps) {
  return (
    <Link
      to="/sos"
      aria-label="Trigger SOS emergency alert"
      data-ocid="sos_button"
      className={cn(
        "gradient-sos inline-flex items-center justify-center rounded-full font-display font-bold text-white",
        "shadow-elevated transition-smooth hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40 active:scale-95",
        "animate-sos-pulse",
        size === "nav" ? "h-16 w-16 text-lg" : "h-20 w-20 text-2xl",
        className,
      )}
    >
      SOS
    </Link>
  );
}
