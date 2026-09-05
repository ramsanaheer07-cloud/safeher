import { CheckInPage } from "@/pages/CheckInPage";
import { Principal } from "@icp-sdk/core/principal";
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
      <CheckInPage />
    </QueryClientProvider>,
  );
}

function mockGeolocation(latitude = 1.5, longitude = 2.5, accuracy = 5) {
  Object.defineProperty(navigator, "geolocation", {
    value: {
      getCurrentPosition: (
        success: (pos: {
          coords: { latitude: number; longitude: number; accuracy: number };
        }) => void,
      ) => success({ coords: { latitude, longitude, accuracy } }),
    },
    configurable: true,
  });
}

const activeState = {
  checkedInAtNs: BigInt(Date.now()) * 1_000_000n,
  location: { latitude: 1.5, longitude: 2.5, accuracyM: 5 },
};

const history = [
  {
    id: 1n,
    kind: "checkIn" as const,
    timestamp: BigInt(Date.now()) * 1_000_000n,
    location: { latitude: 1.5, longitude: 2.5, accuracyM: 5 },
  },
  {
    id: 2n,
    kind: "checkOut" as const,
    timestamp: BigInt(Date.now()) * 1_000_000n,
    location: { latitude: 3.5, longitude: 4.5, accuracyM: 8 },
  },
];

describe("CheckInPage", () => {
  it("shows the checked-out state with an empty history", async () => {
    const actor = createMockActor();
    actor.getCheckInState.mockResolvedValue(null);
    actor.listCheckInHistory.mockResolvedValue([]);
    actor.listContacts.mockResolvedValue([]);
    mockInfrastructure(actor);
    renderPage(actor);

    expect(await screen.findByText("Checked out")).toBeInTheDocument();
    expect(
      screen.getByText("You're not currently checked in"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Check in" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No check-ins yet")).toBeInTheDocument();
  });

  it("records the current location and time on check-in and shows the active state", async () => {
    const user = userEvent.setup();
    const actor = createMockActor();
    actor.getCheckInState
      .mockResolvedValueOnce(null)
      .mockResolvedValue(activeState);
    actor.listCheckInHistory.mockResolvedValue([]);
    actor.listContacts.mockResolvedValue([]);
    actor.checkIn.mockResolvedValue(activeState);
    mockGeolocation();
    mockInfrastructure(actor);
    renderPage(actor);

    await screen.findByText("Checked out");
    await user.click(screen.getByRole("button", { name: "Check in" }));

    // The backend records the current location snapshot.
    await waitFor(() => {
      expect(actor.checkIn).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: 1.5,
          longitude: 2.5,
          accuracyM: 5,
        }),
      );
    });

    // The active checked-in state is shown with elapsed time.
    expect(await screen.findByText("Checked in")).toBeInTheDocument();
    expect(screen.getByText(/Checked in for/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Check out" }),
    ).toBeInTheDocument();
  });

  it("returns to checked-out when the user checks out", async () => {
    const user = userEvent.setup();
    const actor = createMockActor();
    actor.getCheckInState
      .mockResolvedValueOnce(activeState)
      .mockResolvedValue(null);
    actor.listCheckInHistory.mockResolvedValue([]);
    actor.listContacts.mockResolvedValue([]);
    actor.checkOut.mockResolvedValue({
      id: 3n,
      kind: "checkOut",
      timestamp: BigInt(Date.now()) * 1_000_000n,
      location: { latitude: 1.5, longitude: 2.5, accuracyM: 5 },
    });
    mockGeolocation();
    mockInfrastructure(actor);
    renderPage(actor);

    await screen.findByText("Checked in");
    await user.click(screen.getByRole("button", { name: "Check out" }));

    await waitFor(() => {
      expect(actor.checkOut).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: 1.5,
          longitude: 2.5,
          accuracyM: 5,
        }),
      );
    });

    expect(await screen.findByText("Checked out")).toBeInTheDocument();
  });

  it("lists check-in/check-out history with location and time, and expands a map view", async () => {
    const user = userEvent.setup();
    const actor = createMockActor();
    actor.getCheckInState.mockResolvedValue(null);
    actor.listCheckInHistory.mockResolvedValue(history);
    actor.listContacts.mockResolvedValue([]);
    mockInfrastructure(actor);
    renderPage(actor);

    // Both events are listed with their kind and coordinates.
    expect(await screen.findByText("1.50000, 2.50000")).toBeInTheDocument();
    expect(screen.getByText("3.50000, 4.50000")).toBeInTheDocument();
    // The history lists a check-in and a check-out entry (the state card also
    // shows "Checked out", so use the plural matcher).
    expect(screen.getAllByText("Checked in").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Checked out").length).toBeGreaterThan(1);

    // Expanding an entry opens a map view of that location.
    const entries = screen.getAllByRole("button", { name: /View map/ });
    await user.click(entries[0]);
    expect(screen.getAllByTestId("map_canvas").length).toBeGreaterThan(1);
  });

  it("surfaces the trusted-contact history view", async () => {
    const actor = createMockActor();
    actor.getCheckInState.mockResolvedValue(null);
    actor.listCheckInHistory.mockResolvedValue([]);
    actor.listContacts.mockResolvedValue([
      {
        id: 1n,
        name: "Ada",
        phone: "+1",
        principal: Principal.fromText("aaaaa-aa"),
      },
    ]);
    mockInfrastructure(actor);
    renderPage(actor);

    // The trusted-contact history section and its contact selector render.
    expect(
      await screen.findByText("Trusted contacts' activity"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("contact_history_select")).toBeInTheDocument();
  });
});
