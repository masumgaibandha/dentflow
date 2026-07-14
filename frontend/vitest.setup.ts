import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// Not using vitest's `globals: true` mode (this project's test files import
// describe/it/expect explicitly, matching the backend's convention), so
// Testing Library's automatic per-test cleanup - which detects a global
// `afterEach` - never registers itself. Without this, every test in a file
// would accumulate the previous tests' rendered DOM.
afterEach(() => {
  cleanup();
});

// Recharts' ResponsiveContainer measures its parent via ResizeObserver, which
// jsdom does not implement. A minimal no-op stub is enough for it to render
// without throwing in tests - actual resize behavior is a browser concern,
// verified separately in browser testing, not here.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}
