import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PortalShell } from "@/components/layout/PortalShell";

const pushMock = vi.fn();
const replaceMock = vi.fn();
let mockPathname = "/portal";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  usePathname: () => mockPathname,
}));

const logoutMock = vi.fn();
let mockMeData: { user: { name: string; role: "patient" }; clinic: { name: string } } | undefined;

vi.mock("@/hooks/useAuth", () => ({
  useMe: () => ({ data: mockMeData, isLoading: false, isError: false }),
  useLogout: () => logoutMock,
}));

vi.mock("@/lib/auth/token", () => ({
  getToken: () => "fake-token",
}));

function setPatient() {
  mockMeData = { user: { name: "Alex Morgan", role: "patient" }, clinic: { name: "Test Clinic" } };
}

function openMenu() {
  fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
  return document.getElementById("portal-mobile-menu")!;
}

describe("PortalShell mobile navigation", () => {
  beforeEach(() => {
    pushMock.mockClear();
    replaceMock.mockClear();
    logoutMock.mockClear();
    mockPathname = "/portal";
    setPatient();
  });

  it("renders an accessible mobile menu button", () => {
    render(
      <PortalShell>
        <div />
      </PortalShell>,
    );
    const button = screen.getByRole("button", { name: "Open menu" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls", "portal-mobile-menu");
  });

  it("shows only the patient's valid routes", () => {
    render(
      <PortalShell>
        <div />
      </PortalShell>,
    );
    const menu = openMenu();
    for (const label of ["Dashboard", "Appointments", "Invoices", "Medical records"]) {
      expect(within(menu).getByText(label)).toBeInTheDocument();
    }
  });

  it("never shows admin/staff-only routes", () => {
    render(
      <PortalShell>
        <div />
      </PortalShell>,
    );
    const menu = openMenu();
    for (const label of ["Patients", "Dentists", "Services", "Settings", "Staff"]) {
      expect(within(menu).queryByText(label)).not.toBeInTheDocument();
    }
  });

  it("closes the menu when a link is selected", () => {
    render(
      <PortalShell>
        <div />
      </PortalShell>,
    );
    const menu = openMenu();
    fireEvent.click(within(menu).getByText("Appointments"));
    expect(document.getElementById("portal-mobile-menu")).not.toBeInTheDocument();
  });

  it("keeps logout accessible from the mobile menu", () => {
    render(
      <PortalShell>
        <div />
      </PortalShell>,
    );
    const menu = openMenu();
    fireEvent.click(within(menu).getByRole("button", { name: "Log out" }));
    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith("/login");
  });

  it("still renders the desktop navigation (CSS-hidden on mobile, not removed)", () => {
    render(
      <PortalShell>
        <div />
      </PortalShell>,
    );
    expect(screen.getAllByText("Appointments").length).toBeGreaterThan(0);
  });

  it("renders no nested interactive elements", () => {
    const { container } = render(
      <PortalShell>
        <div />
      </PortalShell>,
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
