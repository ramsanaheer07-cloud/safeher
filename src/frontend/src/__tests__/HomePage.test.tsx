import { HomePage } from "@/pages/HomePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createMockActor, mockInfrastructure } from "./mock-infrastructure";
import { renderWithRouter } from "./render-helper";

function renderHome() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapped = () => (
    <QueryClientProvider client={queryClient}>
      <HomePage />
    </QueryClientProvider>
  );
  return renderWithRouter(Wrapped, "/");
}

describe("HomePage (default route)", () => {
  it("renders the dashboard without a blank screen", async () => {
    const actor = createMockActor();
    actor.getLocation.mockResolvedValue(null);
    mockInfrastructure(actor);
    renderHome();

    // The default route must render real content, not a blank shell.
    expect(
      await screen.findByRole("heading", { name: "Welcome back" }),
    ).toBeInTheDocument();
    expect(screen.getByText("You're safe here.")).toBeInTheDocument();
  });

  it("offers quick access to the core safety tools", async () => {
    const actor = createMockActor();
    actor.getLocation.mockResolvedValue(null);
    mockInfrastructure(actor);
    renderHome();

    expect(
      await screen.findByRole("link", { name: /Trusted Contacts/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Safety Timer/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Safety Resources/ }),
    ).toBeInTheDocument();
  });

  it("renders the embedded map and surfaces the check-in quick action", async () => {
    const actor = createMockActor();
    actor.getLocation.mockResolvedValue(null);
    mockInfrastructure(actor);
    renderHome();

    // The home screen embeds an interactive map canvas.
    expect(await screen.findByTestId("map_canvas")).toBeInTheDocument();
    expect(screen.getByText("Your location")).toBeInTheDocument();
    // The standalone check-in feature is surfaced from the home screen.
    expect(screen.getByRole("link", { name: /Check in/ })).toBeInTheDocument();
  });

  it("shows the live location marker and center control when a position is available", async () => {
    const actor = createMockActor();
    actor.getLocation.mockResolvedValue(null);
    mockInfrastructure(actor);

    // Simulate the browser reporting a live position via watchPosition.
    const watchCallback = vi.fn();
    Object.defineProperty(navigator, "geolocation", {
      value: {
        watchPosition: (
          success: (pos: {
            coords: { latitude: number; longitude: number; accuracy: number };
          }) => void,
        ) => {
          watchCallback.mockImplementation(success);
          success({
            coords: { latitude: 40.7, longitude: -74.0, accuracy: 12 },
          });
          return 1;
        },
        clearWatch: () => {},
      },
      configurable: true,
    });

    renderHome();

    // The map canvas and the center-on-me control appear once a point exists.
    expect(await screen.findByTestId("map_canvas")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Center on my location" }),
    ).toBeInTheDocument();
  });
});
