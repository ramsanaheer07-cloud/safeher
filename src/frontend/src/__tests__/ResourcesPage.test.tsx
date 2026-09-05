import { ResourcesPage } from "@/pages/ResourcesPage";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

describe("ResourcesPage", () => {
  it("lists resources and filters by category", async () => {
    const user = userEvent.setup();
    render(<ResourcesPage />);

    expect(screen.getByText("National emergency number")).toBeInTheDocument();
    expect(
      screen.getByText("Stay aware of your surroundings"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Helplines" }));
    expect(screen.getByText("National emergency number")).toBeInTheDocument();
    expect(
      screen.queryByText("Stay aware of your surroundings"),
    ).not.toBeInTheDocument();
  });

  it("opens a resource detail view with full content", async () => {
    const user = userEvent.setup();
    render(<ResourcesPage />);

    await user.click(
      screen.getByRole("button", { name: "Open National emergency number" }),
    );

    const detail = screen.getByTestId("resources_detail");
    expect(
      within(detail).getByText("National emergency number"),
    ).toBeInTheDocument();
    expect(
      within(detail).getByText(/In an emergency, call 911/),
    ).toBeInTheDocument();
  });
});
