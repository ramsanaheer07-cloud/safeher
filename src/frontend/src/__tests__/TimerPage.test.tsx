import { TimerPage } from "@/pages/TimerPage";
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
      <TimerPage />
    </QueryClientProvider>,
  );
}

const activeTimer = {
  startedAtNs: BigInt(Date.now()) * 1_000_000n,
  durationSec: 1800n,
  status: "active" as const,
  lastCheckInAtNs: BigInt(Date.now()) * 1_000_000n,
};

describe("TimerPage", () => {
  it("starts a timer for the chosen duration", async () => {
    const user = userEvent.setup();
    const actor = createMockActor();
    actor.getTimer.mockResolvedValue(null);
    actor.startTimer.mockResolvedValue(activeTimer);
    mockInfrastructure(actor);
    renderPage(actor);

    await screen.findByText("Ready when you are");
    await user.click(screen.getByRole("button", { name: "Start timer" }));

    await waitFor(() => {
      expect(actor.startTimer).toHaveBeenCalledWith(1800n);
    });
  });

  it("shows the active timer and stops it early", async () => {
    const user = userEvent.setup();
    const actor = createMockActor();
    actor.getTimer.mockResolvedValue(activeTimer);
    actor.stopTimer.mockResolvedValue({ ...activeTimer, status: "stopped" });
    mockInfrastructure(actor);
    renderPage(actor);

    expect(await screen.findByRole("timer")).toBeInTheDocument();
    expect(screen.getByText(/Active — sharing location/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Stop timer" }));
    await waitFor(() => {
      expect(actor.stopTimer).toHaveBeenCalled();
    });
  });

  it("checks in with the current location while the timer is active", async () => {
    const user = userEvent.setup();
    const actor = createMockActor();
    actor.getTimer.mockResolvedValue(activeTimer);
    actor.timerCheckIn.mockResolvedValue({
      ...activeTimer,
      lastCheckInAtNs: BigInt(Date.now()) * 1_000_000n,
    });
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (
          success: (pos: {
            coords: { latitude: number; longitude: number; accuracy: number };
          }) => void,
        ) =>
          success({ coords: { latitude: 1.5, longitude: 2.5, accuracy: 5 } }),
      },
      configurable: true,
    });
    mockInfrastructure(actor);
    renderPage(actor);

    expect(await screen.findByRole("timer")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Check in" }));

    await waitFor(() => {
      expect(actor.timerCheckIn).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: 1.5,
          longitude: 2.5,
          accuracyM: 5,
        }),
      );
    });
  });
});
