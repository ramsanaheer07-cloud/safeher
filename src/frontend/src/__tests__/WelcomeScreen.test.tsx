import { WelcomeScreen } from "@/components/WelcomeScreen";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createMockActor, mockInfrastructure } from "./mock-infrastructure";

describe("WelcomeScreen (unauthenticated landing)", () => {
  it("shows the reassuring brand and a sign-in action", () => {
    mockInfrastructure(createMockActor(), { isAuthenticated: false });
    render(<WelcomeScreen />);

    expect(
      screen.getByRole("heading", { name: "SafeHer" }),
    ).toBeInTheDocument();
    expect(screen.getByText("You're safe here.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sign in with Internet Identity" }),
    ).toBeInTheDocument();
  });

  it("surfaces a login error when authentication fails", () => {
    mockInfrastructure(createMockActor(), {
      isAuthenticated: false,
      isLoginError: true,
      loginError: new Error("Login failed"),
    });
    render(<WelcomeScreen />);

    expect(screen.getByRole("alert")).toHaveTextContent("Login failed");
  });

  it("disables the sign-in button while a login is in progress", () => {
    mockInfrastructure(createMockActor(), {
      isAuthenticated: false,
      isLoggingIn: true,
    });
    render(<WelcomeScreen />);

    expect(screen.getByRole("button", { name: "Signing in…" })).toBeDisabled();
  });
});
