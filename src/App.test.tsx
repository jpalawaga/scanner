import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("navigates from Home to the QR scan screen", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole("button", { name: "Record new interaction" }));

    expect(screen.getByRole("heading", { name: "Scan QR code" })).toBeInTheDocument();
    expect(await screen.findByText("Camera unavailable")).toBeInTheDocument();
  });

  it("opens manual entry without scanning", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole("button", { name: "Enter manually" }));

    expect(screen.getByText("New interaction")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Company name" })).toBeInTheDocument();
  });

  it("edits an existing interaction from the home screen", async () => {
    const user = userEvent.setup();
    window.localStorage.clear();

    render(<App />);

    await user.click(screen.getByRole("button", { name: "Enter manually" }));
    await user.type(screen.getByRole("textbox", { name: "Company name" }), "Acme");
    await user.click(screen.getByRole("button", { name: "Done" }));

    await user.click(screen.getByRole("button", { name: "Edit interaction with Acme" }));

    const companyField = screen.getByRole("textbox", { name: "Company name" });
    expect(companyField).toHaveValue("Acme");
    await user.clear(companyField);
    await user.type(companyField, "Acme Corp");
    await user.click(screen.getByRole("button", { name: "Done" }));

    expect(
      screen.getByRole("button", { name: "Edit interaction with Acme Corp" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Edit interaction with Acme" }),
    ).not.toBeInTheDocument();
  });
});
