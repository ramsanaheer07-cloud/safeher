import { SosButton } from "@/components/SosButton";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  BellRing,
  BookOpen,
  Clock,
  EyeOff,
  Home,
  MessageCircle,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
}

const navItems: NavItem[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/timer", label: "Timer", icon: Clock },
  { to: "/resources", label: "Resources", icon: BookOpen },
];

const safetyItems: NavItem[] = [
  { to: "/fake-call", label: "Fake Call", icon: Phone },
  { to: "/discreet", label: "Discreet", icon: EyeOff },
  { to: "/check-in", label: "Check in", icon: BellRing },
  { to: "/safety-tools", label: "Tools", icon: ShieldCheck },
];

/**
 * Persistent bottom navigation bar. The SOS button sits centrally and is
 * oversized, overlapping the top edge of the bar so it is always reachable.
 * Safety tools (fake call, discreet mode, auto check-ins) render as a compact
 * row above the primary links so every signed-in user can reach them.
 */
export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      data-ocid="bottom_nav"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur"
    >
      <div className="mx-auto max-w-md px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        <div
          data-ocid="safety_tools_nav"
          className="mb-2 grid grid-cols-4 gap-1 border-b border-border pb-2"
        >
          {safetyItems.map((item) => (
            <NavLink key={item.to} item={item} />
          ))}
        </div>

        <div className="grid grid-cols-6 items-end">
          {navItems.slice(0, 3).map((item) => (
            <NavLink key={item.to} item={item} />
          ))}

          <div className="flex justify-center">
            <div className="-mt-8">
              <SosButton />
            </div>
          </div>

          {navItems.slice(3).map((item) => (
            <NavLink key={item.to} item={item} />
          ))}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      data-ocid={`nav_link_${item.label.toLowerCase().replace(/\s+/g, "_")}`}
      className={cn(
        "flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-medium",
        "text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "aria-[current=page]:text-primary",
      )}
      activeOptions={{ exact: item.to === "/" }}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  );
}
