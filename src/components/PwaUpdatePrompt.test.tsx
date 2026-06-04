import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PwaUpdatePrompt } from "./PwaUpdatePrompt";

const updateServiceWorker = vi.fn();
let initialNeedRefresh = false;

vi.mock("virtual:pwa-register/react", () => ({
  useRegisterSW: vi.fn(() => {
    const [needRefresh, setNeedRefresh] = useState(initialNeedRefresh);

    return {
      needRefresh: [needRefresh, setNeedRefresh],
      offlineReady: [false, vi.fn()],
      updateServiceWorker,
    };
  }),
}));

describe("PwaUpdatePrompt", () => {
  beforeEach(() => {
    initialNeedRefresh = false;
    updateServiceWorker.mockClear();
  });

  it("does not render until an update is available", () => {
    render(<PwaUpdatePrompt />);

    expect(screen.queryByText("Update available")).not.toBeInTheDocument();
  });

  it("requests service worker activation when the user updates", async () => {
    const user = userEvent.setup();
    initialNeedRefresh = true;

    render(<PwaUpdatePrompt />);

    await user.click(screen.getByRole("button", { name: "Update" }));

    expect(updateServiceWorker).toHaveBeenCalledWith(true);
  });

  it("can be dismissed", async () => {
    const user = userEvent.setup();
    initialNeedRefresh = true;

    render(<PwaUpdatePrompt />);

    await user.click(screen.getByRole("button", { name: "Dismiss update" }));

    expect(screen.queryByText("Update available")).not.toBeInTheDocument();
  });
});
