import { DiscreetModePage } from "@/pages/DiscreetModePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  type MockActor,
  createMockActor,
  mockInfrastructure,
} from "./mock-infrastructure";

function renderPage(_actor: MockActor) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <DiscreetModePage />
    </QueryClientProvider>,
  );
}

describe("DiscreetModePage", () => {
  it("shows the off state and enables discreet mode", async () => {
    const user = userEvent.setup();
    const actor = createMockActor();
    actor.getDiscreetMode.mockResolvedValue(false);
    actor.setDiscreetMode.mockResolvedValue(true);
    mockInfrastructure(actor);
    renderPage(actor);

    expect(
      await screen.findByText("Off — your app looks like SafeHer"),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Turn discreet mode on" }),
    );

    await waitFor(() => {
      expect(actor.setDiscreetMode).toHaveBeenCalledWith(true);
    });
  });

  it("shows the on state when discreet mode is enabled", async () => {
    const actor = createMockActor();
    actor.getDiscreetMode.mockResolvedValue(true);
    mockInfrastructure(actor);
    renderPage(actor);

    expect(
      await screen.findByText("On — your app is disguised"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Turn discreet mode off" }),
    ).toBeInTheDocument();
  });
});
