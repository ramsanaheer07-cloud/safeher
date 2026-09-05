import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";

// Import the shared infrastructure mock so its `vi.mock` registrations are in
// place before any test file — and its transitive import of the real
// `@caffeineai/*` packages — is evaluated. This makes the mock robust to
// import order in individual test files.
import "./mock-infrastructure";

// Generated components use `data-ocid` as their test id attribute.
configure({ testIdAttribute: "data-ocid" });

// sonner's <Toaster /> calls window.matchMedia on mount; jsdom does not provide it.
if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// Radix UI Select (and other pointer-driven primitives) call pointer-capture
// methods that jsdom does not implement. Polyfill them so the trusted-contact
// dropdown can be driven with userEvent in component tests.
if (typeof Element !== "undefined") {
  if (typeof Element.prototype.hasPointerCapture !== "function") {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (typeof Element.prototype.setPointerCapture !== "function") {
    Element.prototype.setPointerCapture = () => {};
  }
  if (typeof Element.prototype.releasePointerCapture !== "function") {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (typeof Element.prototype.scrollIntoView !== "function") {
    Element.prototype.scrollIntoView = () => {};
  }
}
