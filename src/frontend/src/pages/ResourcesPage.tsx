import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resources } from "@/data/resources";
import { cn } from "@/lib/utils";
import type { ResourceCategory } from "@/types";
import {
  BookOpen,
  HeartHandshake,
  MapPin,
  Phone,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import { useState } from "react";

type FilterKey = ResourceCategory | "all";

const categories: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "helplines", label: "Helplines" },
  { key: "self-defense", label: "Self-defense" },
  { key: "travel-safety", label: "Travel" },
  { key: "digital-safety", label: "Digital" },
];

const categoryIcons: Record<ResourceCategory, typeof ShieldCheck> = {
  helplines: Phone,
  "self-defense": ShieldCheck,
  "travel-safety": MapPin,
  "digital-safety": Wifi,
};

const categoryDescriptions: Record<ResourceCategory, string> = {
  helplines:
    "Confidential support and emergency numbers, available when you need them.",
  "self-defense":
    "Awareness habits and practical techniques to stay in control.",
  "travel-safety": "Tips for staying safe on the move, from routes to rides.",
  "digital-safety":
    "Protect your accounts, location, and personal information online.",
};

/**
 * Safety Resources Hub. Curated tips, helplines, and emergency numbers
 * organized by category. Each resource opens a detail view with full content.
 */
export function ResourcesPage() {
  const [active, setActive] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<string | null>(null);

  const visible =
    active === "all"
      ? resources
      : resources.filter((r) => r.category === active);

  const selectedResource = resources.find((r) => r.id === selected) ?? null;
  const SelectedIcon = selectedResource
    ? categoryIcons[selectedResource.category]
    : BookOpen;

  return (
    <div className="space-y-6" data-ocid="resources_page">
      <section className="animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Safety Resources
        </h1>
        <p className="mt-1 text-muted-foreground">
          Tips, helplines, and emergency numbers to keep you informed and in
          control.
        </p>
      </section>

      <div
        data-ocid="resources_filter"
        className="animate-fade-up flex gap-2 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Filter resources by category"
      >
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            role="tab"
            aria-selected={active === cat.key}
            onClick={() => setActive(cat.key)}
            data-ocid={`resources_filter_${cat.key}`}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active === cat.key
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground shadow-subtle hover:text-foreground",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {active !== "all" && (
        <p
          data-ocid="resources_category_description"
          className="animate-fade-up text-sm text-muted-foreground"
        >
          {categoryDescriptions[active]}
        </p>
      )}

      <section data-ocid="resources_list" className="space-y-3">
        {visible.map((resource, index) => {
          const Icon = categoryIcons[resource.category];
          return (
            <button
              key={resource.id}
              type="button"
              onClick={() => setSelected(resource.id)}
              data-ocid={`resources_item.${index + 1}`}
              aria-label={`Open ${resource.title}`}
              className="animate-fade-up flex w-full items-start gap-4 rounded-2xl bg-card p-5 text-left shadow-subtle transition-smooth hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ animationDelay: `${0.05 * index}s` }}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-base font-bold text-foreground">
                  {resource.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {resource.summary}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="mt-1 shrink-0 text-muted-foreground"
              >
                <BookOpen className="h-5 w-5" />
              </span>
            </button>
          );
        })}
      </section>

      <Dialog
        open={selectedResource !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent
          data-ocid="resources_detail"
          className="max-h-[85dvh] overflow-y-auto sm:max-w-lg"
        >
          {selectedResource && (
            <>
              <DialogHeader>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <SelectedIcon className="h-6 w-6" aria-hidden="true" />
                </span>
                <DialogTitle className="mt-3 font-display text-xl font-bold text-foreground">
                  {selectedResource.title}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {selectedResource.summary}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
                {selectedResource.content.split("\n\n").map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
