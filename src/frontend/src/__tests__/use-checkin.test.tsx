import {
  useCheckInHistoryFor,
  usePerformCheckIn,
  usePerformCheckOut,
} from "@/hooks/use-checkin";
import { Principal } from "@icp-sdk/core/principal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  type MockActor,
  createMockActor,
  mockInfrastructure,
} from "./mock-infrastructure";

function wrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

const location = {
  latitude: 1.5,
  longitude: 2.5,
  accuracyM: 5,
  capturedAtNs: BigInt(Date.now()) * 1_000_000n,
};

describe("use-checkin hooks", () => {
  it("fetches a trusted contact's check-in history for the given principal", async () => {
    const actor = createMockActor();
    const principal = Principal.fromText("aaaaa-aa");
    const contactHistory = [
      {
        id: 1n,
        kind: "checkIn" as const,
        timestamp: BigInt(Date.now()) * 1_000_000n,
        location: { latitude: 1.5, longitude: 2.5, accuracyM: 5 },
      },
    ];
    actor.getCheckInHistoryFor.mockResolvedValue(contactHistory);
    mockInfrastructure(actor);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useCheckInHistoryFor(principal), {
      wrapper: wrapper(queryClient),
    });

    await waitFor(() => {
      expect(actor.getCheckInHistoryFor).toHaveBeenCalledWith(principal);
    });
    await waitFor(() => {
      expect(result.current.data).toEqual(contactHistory);
    });
  });

  it("records a standalone check-in at the given location", async () => {
    const actor = createMockActor();
    const active = {
      checkedInAtNs: BigInt(Date.now()) * 1_000_000n,
      location: { latitude: 1.5, longitude: 2.5, accuracyM: 5 },
    };
    actor.checkIn.mockResolvedValue(active);
    mockInfrastructure(actor);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => usePerformCheckIn(), {
      wrapper: wrapper(queryClient),
    });

    result.current.mutate(location);
    await waitFor(() => {
      expect(actor.checkIn).toHaveBeenCalledWith(location);
    });
  });

  it("records a standalone check-out at the given location", async () => {
    const actor = createMockActor();
    const event = {
      id: 2n,
      kind: "checkOut" as const,
      timestamp: BigInt(Date.now()) * 1_000_000n,
      location: { latitude: 1.5, longitude: 2.5, accuracyM: 5 },
    };
    actor.checkOut.mockResolvedValue(event);
    mockInfrastructure(actor);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => usePerformCheckOut(), {
      wrapper: wrapper(queryClient),
    });

    result.current.mutate(location);
    await waitFor(() => {
      expect(actor.checkOut).toHaveBeenCalledWith(location);
    });
  });
});
