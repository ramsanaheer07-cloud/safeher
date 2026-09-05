import { SosPage } from "@/pages/SosPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  type MockActor,
  createMockActor,
  mockInfrastructure,
} from "./mock-infrastructure";

// SosButton renders a router <Link>; render it as a plain anchor so the page
// can be tested without a RouterProvider (whose async load fights fake timers).
vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    Link: ({
      to,
      children,
      ...props
    }: { to: string; children: React.ReactNode } & Record<string, unknown>) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

function renderPage(_actor: MockActor) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SosPage />
    </QueryClientProvider>,
  );
}

const sentAlert = {
  id: 1n,
  status: "alerted" as const,
  alertedContacts: [1n],
  timestamp: 1n,
  location: { latitude: 1, longitude: 2 },
};

describe("SosPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (
          success: (pos: {
            coords: { latitude: number; longitude: number };
          }) => void,
        ) => success({ coords: { latitude: 1, longitude: 2 } }),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows a countdown with a cancel option when SOS is started", () => {
    const actor = createMockActor();
    actor.listContacts.mockResolvedValue([]);
    mockInfrastructure(actor);
    renderPage(actor);

    fireEvent.click(screen.getByRole("button", { name: "Start SOS" }));

    expect(screen.getByTestId("sos_countdown")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("cancelling the countdown returns to idle without sending an alert", () => {
    const actor = createMockActor();
    actor.listContacts.mockResolvedValue([]);
    mockInfrastructure(actor);
    renderPage(actor);

    fireEvent.click(screen.getByRole("button", { name: "Start SOS" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByTestId("sos_idle")).toBeInTheDocument();
    expect(actor.triggerSos).not.toHaveBeenCalled();
  });

  it("confirms contacts were alerted when the countdown completes", async () => {
    const actor = createMockActor();
    actor.listContacts.mockResolvedValue([]);
    actor.triggerSos.mockResolvedValue(sentAlert);
    mockInfrastructure(actor);
    renderPage(actor);

    fireEvent.click(screen.getByRole("button", { name: "Start SOS" }));
    // The countdown runs for COUNTDOWN_SECONDS (5) one-second ticks. Each tick
    // schedules the next via a React effect, so advance one second at a time
    // inside act() to let the re-render and effect re-run settle between ticks.
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
    }
    // The countdown has reached 0; flush the async location capture + mutation.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(actor.triggerSos).toHaveBeenCalledWith({
      latitude: 1,
      longitude: 2,
    });
    expect(screen.getByTestId("sos_sent")).toBeInTheDocument();
    expect(
      screen.getByText(/Your contacts have been alerted/),
    ).toBeInTheDocument();
  });
});
