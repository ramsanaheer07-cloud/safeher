import App from "@/App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createMockActor, mockInfrastructure } from "./mock-infrastructure";

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

describe("App auth gating", () => {
  it("shows the welcome screen with a sign-in option when unauthenticated", () => {
    mockInfrastructure(createMockActor(), { isAuthenticated: false });
    renderApp();
    expect(
      screen.getByRole("heading", { name: "SafeHer" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sign in with Internet Identity" }),
    ).toBeInTheDocument();
  });

  it("reaches the main app shell when authenticated", async () => {
    mockInfrastructure(createMockActor(), { isAuthenticated: true });
    renderApp();
    // The authenticated shell renders the home page and persistent navigation.
    expect(
      await screen.findByRole("heading", { name: "Welcome back" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Primary")).toBeInTheDocument();
  });
});
