import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { createEmptyInteractionDraft, type InteractionDraft } from "../data/interactions";
import { AddInteractionScreen } from "./AddInteractionScreen";

function renderHarness(initialDraft: InteractionDraft, onSave = vi.fn(), onAddPlatformOption = vi.fn()) {
  function Harness() {
    const [draft, setDraft] = useState(initialDraft);

    return (
      <AddInteractionScreen
        availablePlatformOptions={[]}
        draft={draft}
        onAddPlatformOption={onAddPlatformOption}
        onBack={vi.fn()}
        onChange={setDraft}
        onSave={onSave}
        onScanParticipant={vi.fn()}
      />
    );
  }

  render(<Harness />);
}

describe("AddInteractionScreen", () => {
  it("shows scanned company and participants", () => {
    renderHarness({
      ...createEmptyInteractionDraft(),
      companyName: "ExampleCo",
      participants: ["First Last"],
    });

    expect(screen.getByRole("heading", { name: "New Interaction" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("ExampleCo")).toBeInTheDocument();
    expect(screen.getByDisplayValue("First Last")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Scan" })).toBeInTheDocument();
  });

  it("saves selected features and platform interests", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    renderHarness(
      {
        ...createEmptyInteractionDraft(),
        companyName: "Snowflake",
        participants: ["First Last"],
      },
      onSave,
    );

    await user.click(screen.getByRole("checkbox", { name: "ETL" }));
    await user.click(screen.getByRole("checkbox", { name: "terraform" }));
    await user.type(screen.getByPlaceholderText("Search platforms"), "snow");
    await user.click(screen.getByRole("checkbox", { name: "snowflake" }));
    await user.click(screen.getByRole("button", { name: "Done" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        companyName: "Snowflake",
        participants: ["First Last"],
        features: ["ETL", "terraform"],
        platformInterests: ["snowflake"],
      }),
    );
  });

  it("adds custom platform options from the search text", async () => {
    const user = userEvent.setup();
    const onAddPlatformOption = vi.fn();

    renderHarness(
      {
        ...createEmptyInteractionDraft(),
        companyName: "Oracle",
      },
      vi.fn(),
      onAddPlatformOption,
    );

    await user.type(screen.getByPlaceholderText("Search platforms"), "oracle");
    await user.click(screen.getByRole("button", { name: "Add platform option" }));

    expect(onAddPlatformOption).toHaveBeenCalledWith("oracle");
    expect(screen.getByRole("checkbox", { name: "oracle" })).toBeChecked();
    expect(screen.getByPlaceholderText("Search platforms")).toHaveValue("");
  });
});
