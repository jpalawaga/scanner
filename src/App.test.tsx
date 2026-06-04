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
});
