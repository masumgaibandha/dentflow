import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/login",
}));

const mutateAsyncMock = vi.fn();
let mockIsPending = false;

vi.mock("@/hooks/useAuth", () => ({
  useLoginMutation: () => ({ mutateAsync: mutateAsyncMock, isPending: mockIsPending }),
  useMe: () => ({ data: undefined, isLoading: false, isError: false }),
  useLogout: () => vi.fn(),
}));

vi.mock("@/lib/auth/token", () => ({
  getToken: () => null,
}));

function getEmailInput() {
  return screen.getByLabelText("Email") as HTMLInputElement;
}
function getPasswordInput() {
  return screen.getByLabelText("Password") as HTMLInputElement;
}

describe("Login page", () => {
  beforeEach(() => {
    pushMock.mockClear();
    mutateAsyncMock.mockReset();
    mockIsPending = false;
  });

  it("renders exactly three demo buttons", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: "Admin" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Staff" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Patient" })).toBeInTheDocument();
  });

  it("fills the expected credentials for the Admin demo button", () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: "Admin" }));
    expect(getEmailInput().value).toBe("admin@dentflow.demo");
    expect(getPasswordInput().value).toBe("DemoAdmin123!");
  });

  it("fills the expected credentials for the Staff demo button", () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: "Staff" }));
    expect(getEmailInput().value).toBe("staff@dentflow.demo");
    expect(getPasswordInput().value).toBe("DemoStaff123!");
  });

  it("fills the expected credentials for the Patient demo button", () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: "Patient" }));
    expect(getEmailInput().value).toBe("patient@dentflow.demo");
    expect(getPasswordInput().value).toBe("DemoPatient123!");
  });

  it("does not submit the form when a demo button is clicked", () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: "Admin" }));
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it("still submits normally via the Log in button", async () => {
    mutateAsyncMock.mockResolvedValue({ user: { role: "admin" }, clinic: {}, token: "t" });
    render(<LoginPage />);
    fireEvent.change(getEmailInput(), { target: { value: "someone@example.com" } });
    fireEvent.change(getPasswordInput(), { target: { value: "Password123!" } });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));
    await waitFor(() => expect(mutateAsyncMock).toHaveBeenCalledWith({
      email: "someone@example.com",
      password: "Password123!",
    }));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"));
  });

  it("does not render a role selector", () => {
    render(<LoginPage />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.queryByText(/select.*role/i)).not.toBeInTheDocument();
  });
});
