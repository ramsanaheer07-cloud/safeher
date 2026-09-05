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

describe("Mock order diagnostic", () => {
  it("reaches the authenticated shell when the mock is imported first", async () => {
    mockInfrastructure(createMockActor(), { isAuthenticated: true });
    renderApp();
    expect(
      await screen.findByRole("heading", { name: "Welcome back" }),
    ).toBeInTheDocument();
  });
});
