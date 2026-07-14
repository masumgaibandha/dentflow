import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardShell } from "@/components/layout/DashboardShell";

const pushMock = vi.fn();
const replaceMock = vi.fn();
let mockPathname = "/patients";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  usePathname: () => mockPathname,
}));

const logoutMock = vi.fn();
let mockMeData:
  | { user: { name: string; role: "admin" | "staff" }; clinic: { name: string } }
  | undefined;

vi.mock("@/hooks/useAuth", () => ({
  useMe: () => ({ data: mockMeData, isLoading: false, isError: false }),
  useLogout: () => logoutMock,
}));

vi.mock("@/lib/auth/token", () => ({
  getToken: () => "fake-token",
}));

function setUser(role: "admin" | "staff") {
  mockMeData = { user: { name: "Test User", role }, clinic: { name: "Test Clinic" } };
}

function openMenu() {
  fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
  return document.getElementById("dashboard-mobile-menu")!;
}

describe("DashboardShell mobile navigation", () => {
  beforeEach(() => {
    pushMock.mockClear();
    replaceMock.mockClear();
    logoutMock.mockClear();
    mockPathname = "/patients";
  });

  it("renders an accessible mobile menu button", () => {
    setUser("admin");
    render(
      <DashboardShell>
        <div />
      </DashboardShell>,
    );
    const button = screen.getByRole("button", { name: "Open menu" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls", "dashboard-mobile-menu");
  });

  it("toggles aria-expanded and opens the menu on click", () => {
    setUser("admin");
    render(
      <DashboardShell>
        <div />
      </DashboardShell>,
    );
    openMenu();
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
  });

  it("shows admin-only links for an admin user", () => {
    setUser("admin");
    render(
      <DashboardShell>
        <div />
      </DashboardShell>,
    );
    const menu = openMenu();
    for (const label of ["Dashboard", "Patients", "Dentists", "Appointments", "Invoices", "Services", "Settings", "Staff"]) {
      expect(within(menu).getByText(label)).toBeInTheDocument();
    }
  });

  it("hides admin-only links for a staff user (no path to a 403 page)", () => {
    setUser("staff");
    render(
      <DashboardShell>
        <div />
      </DashboardShell>,
    );
    const menu = openMenu();
    for (const label of ["Dashboard", "Invoices", "Services", "Settings", "Staff"]) {
      expect(within(menu).queryByText(label)).not.toBeInTheDocument();
    }
    for (const label of ["Patients", "Dentists", "Appointments"]) {
      expect(within(menu).getByText(label)).toBeInTheDocument();
    }
  });

  it("closes the menu when a link is selected", () => {
    setUser("admin");
    render(
      <DashboardShell>
        <div />
      </DashboardShell>,
    );
    const menu = openMenu();
    fireEvent.click(within(menu).getByText("Patients"));
    expect(document.getElementById("dashboard-mobile-menu")).not.toBeInTheDocument();
  });

  it("keeps logout accessible from the mobile menu", () => {
    setUser("admin");
    render(
      <DashboardShell>
        <div />
      </DashboardShell>,
    );
    const menu = openMenu();
    fireEvent.click(within(menu).getByRole("button", { name: "Log out" }));
    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith("/login");
  });

  it("still renders the desktop navigation (CSS-hidden on mobile, not removed)", () => {
    setUser("admin");
    render(
      <DashboardShell>
        <div />
      </DashboardShell>,
    );
    expect(screen.getAllByText("Patients").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Log out" }).length).toBeGreaterThan(0);
  });

  it("renders no nested interactive elements", () => {
    setUser("admin");
    const { container } = render(
      <DashboardShell>
        <div />
      </DashboardShell>,
    );
    openMenu();
    for (const anchor of Array.from(container.querySelectorAll("a"))) {
      expect(anchor.querySelector("button, a")).toBeNull();
    }
    for (const button of Array.from(container.querySelectorAll("button"))) {
      expect(button.closest("a")).toBeNull();
    }
  });
});
