import { router } from "@/lib/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createMockActor, mockInfrastructure } from "./mock-infrastructure";

function renderLayout() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("Layout persistent navigation", () => {
  it("keeps the SOS button reachable from the persistent navigation", async () => {
    const actor = createMockActor();
    actor.getDiscreetMode.mockResolvedValue(false);
    mockInfrastructure(actor);
    renderLayout();

    const nav = await screen.findByLabelText("Primary");
    expect(nav).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Trigger SOS emergency alert" }),
    ).toBeInTheDocument();
  });

  it("exposes every core SafeHer destination and the sign-out control", async () => {
    const actor = createMockActor();
    actor.getDiscreetMode.mockResolvedValue(false);
    mockInfrastructure(actor);
    renderLayout();

    const nav = await screen.findByLabelText("Primary");
    // The persistent bottom nav keeps every core tool one tap away.
    for (const label of ["Home", "Contacts", "Timer", "Resources"]) {
      expect(
        within(nav).getByRole("link", { name: label }),
      ).toBeInTheDocument();
    }
    // The header brand links home and the sign-out control is present.
    expect(screen.getByRole("link", { name: "SafeHer" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sign out" }),
    ).toBeInTheDocument();
  });
});
