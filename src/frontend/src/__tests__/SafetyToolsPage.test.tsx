import { SafetyToolsPage } from "@/pages/SafetyToolsPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  type MockActor,
  createMockActor,
  mockInfrastructure,
} from "./mock-infrastructure";
import { renderWithRouter } from "./render-helper";

function renderPage(_actor: MockActor) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapped = () => (
    <QueryClientProvider client={queryClient}>
      <SafetyToolsPage />
    </QueryClientProvider>
  );
  return renderWithRouter(Wrapped, "/safety-tools");
}

describe("SafetyToolsPage", () => {
  it("turns on auto check-in reminders", async () => {
    const user = userEvent.setup();
    const actor = createMockActor();
    actor.getCheckInReminder.mockResolvedValue(null);
    actor.checkInReminderStatus.mockResolvedValue(null);
    actor.setCheckInReminder.mockResolvedValue({
      enabled: true,
      intervalSec: 1800n,
      lastSentAt: 0n,
    });
    mockInfrastructure(actor);
    renderPage(actor);

    await screen.findByText("Auto check-in reminders");
    await user.click(screen.getByRole("button", { name: "Turn on reminders" }));

    await waitFor(() => {
      expect(actor.setCheckInReminder).toHaveBeenCalledWith(1800n);
    });
  });

  it("shows the overdue banner when a check-in is missed", async () => {
    const actor = createMockActor();
    actor.getCheckInReminder.mockResolvedValue({
      enabled: true,
      intervalSec: 1800n,
      lastSentAt: 0n,
    });
    actor.checkInReminderStatus.mockResolvedValue({
      enabled: true,
      intervalSec: 1800n,
      lastSentAt: 0n,
      overdue: true,
      overdueSince: 1n,
    });
    actor.triggerSos.mockResolvedValue({
      id: 1n,
      status: "alerted" as never,
      alertedContacts: [],
      timestamp: 1n,
      location: { latitude: 0, longitude: 0 },
    });
    actor.markCheckIn.mockResolvedValue({
      enabled: true,
      intervalSec: 1800n,
      lastSentAt: 1n,
    });
    mockInfrastructure(actor);
    renderPage(actor);

    expect(
      await screen.findByText("A check-in was missed"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Check in now" }),
    ).toBeInTheDocument();
  });

  it("surfaces the standalone check-in/check-out feature from the hub", async () => {
    const actor = createMockActor();
    actor.getCheckInReminder.mockResolvedValue(null);
    actor.checkInReminderStatus.mockResolvedValue(null);
    mockInfrastructure(actor);
    renderPage(actor);

    // The Check-ins hub links to the standalone check-in/check-out screen.
    expect(
      await screen.findByRole("link", { name: /Check in \/ check out/ }),
    ).toBeInTheDocument();
  });
});
