import { FakeCallPage } from "@/pages/FakeCallPage";
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
      <FakeCallPage />
    </QueryClientProvider>,
  );
}

describe("FakeCallPage", () => {
  it("starts a fake call and shows the incoming-call overlay", async () => {
    const user = userEvent.setup();
    const actor = createMockActor();
    actor.getFakeCall.mockResolvedValue(null);
    actor.startFakeCall.mockResolvedValue({ active: true, startedAt: 1n });
    mockInfrastructure(actor);
    renderPage(actor);

    await user.click(
      await screen.findByRole("button", { name: /Start fake call/ }),
    );

    await waitFor(() => {
      expect(actor.startFakeCall).toHaveBeenCalled();
    });
  });

  it("shows the incoming-call overlay when a fake call is active", async () => {
    const actor = createMockActor();
    actor.getFakeCall.mockResolvedValue({ active: true, startedAt: 1n });
    mockInfrastructure(actor);
    renderPage(actor);

    expect(await screen.findByTestId("fake_call_overlay")).toBeInTheDocument();
    expect(screen.getByText("Mom")).toBeInTheDocument();
  });

  it("declines an active fake call", async () => {
    const user = userEvent.setup();
    const actor = createMockActor();
    actor.getFakeCall.mockResolvedValue({ active: true, startedAt: 1n });
    actor.stopFakeCall.mockResolvedValue({ active: false, startedAt: 1n });
    mockInfrastructure(actor);
    renderPage(actor);

    await screen.findByTestId("fake_call_overlay");
    await user.click(screen.getByLabelText("Decline call"));

    await waitFor(() => {
      expect(actor.stopFakeCall).toHaveBeenCalled();
    });
  });
});
