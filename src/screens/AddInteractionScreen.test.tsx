import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { createEmptyInteractionDraft, createInteractionContact, type InteractionDraft } from "../data/interactions";
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
      contacts: [
        createInteractionContact({
          firstName: "First",
          lastName: "Last",
          companyName: "ExampleCo",
        }),
      ],
    });

    expect(screen.getByText("New interaction")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Company name" })).toHaveValue("ExampleCo");
    expect(screen.getByRole("textbox", { name: "Name for First Last" })).toHaveValue("First Last");
    expect(screen.getByRole("textbox", { name: "Company for First Last" })).toHaveValue("ExampleCo");
    expect(screen.getByRole("textbox", { name: "Email for First Last" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Scan" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("adds a manual participant with name and company", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    renderHarness({ ...createEmptyInteractionDraft(), companyName: "ExampleCo" }, onSave);

    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.type(screen.getByRole("textbox", { name: "Name for participant 1" }), "Jordan Lee");
    await user.click(screen.getByRole("button", { name: "Done" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        participants: ["Jordan Lee"],
        contacts: [
          expect.objectContaining({ firstName: "Jordan Lee", lastName: "", companyName: "ExampleCo" }),
        ],
      }),
    );
  });

  it("adds a custom feature via the Other field", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    renderHarness({ ...createEmptyInteractionDraft(), companyName: "ExampleCo" }, onSave);

    await user.click(screen.getByRole("button", { name: "Other" }));
    await user.type(screen.getByPlaceholderText("Add a feature"), "data residency");
    await user.click(screen.getByRole("button", { name: "Add feature" }));

    expect(screen.getByRole("checkbox", { name: "data residency" })).toBeChecked();

    await user.click(screen.getByRole("button", { name: "Done" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ features: ["data residency"] }),
    );
  });

  it("saves contact email edits", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    renderHarness(
      {
        ...createEmptyInteractionDraft(),
        companyName: "ExampleCo",
        contacts: [
          createInteractionContact({
            firstName: "First",
            lastName: "Last",
            companyName: "ExampleCo",
          }),
        ],
      },
      onSave,
    );

    await user.type(screen.getByRole("textbox", { name: "Email for First Last" }), "first.last@example.test");
    await user.click(screen.getByRole("button", { name: "Done" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        participants: ["First Last"],
        contacts: [
          expect.objectContaining({
            firstName: "First",
            lastName: "Last",
            companyName: "ExampleCo",
            email: "first.last@example.test",
          }),
        ],
      }),
    );
  });

  it("saves selected features and platform interests", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    renderHarness(
      {
        ...createEmptyInteractionDraft(),
        companyName: "ExampleCo",
        contacts: [
          createInteractionContact({
            firstName: "First",
            lastName: "Last",
            companyName: "ExampleCo",
          }),
        ],
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
        companyName: "ExampleCo",
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
