import { render, screen, within } from "@testing-library/react";
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
    await user.type(screen.getByRole("textbox", { name: "Name for participant 1" }), "Manual Contact");
    await user.click(screen.getByRole("button", { name: "Done" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        participants: ["Manual Contact"],
        contacts: [
          expect.objectContaining({ firstName: "Manual Contact", lastName: "", companyName: "ExampleCo" }),
        ],
      }),
    );
  });

  it("adds a custom feature via the Other field", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    renderHarness({ ...createEmptyInteractionDraft(), companyName: "ExampleCo" }, onSave);

    const featuresGroup = screen.getByRole("group", { name: "Features of interest" });
    await user.click(within(featuresGroup).getByRole("button", { name: "Other" }));
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

  it("opens Google Calendar with the participant email", async () => {
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    renderHarness({
      ...createEmptyInteractionDraft(),
      companyName: "ExampleCo",
      contacts: [
        createInteractionContact({
          firstName: "First",
          lastName: "Last",
          companyName: "ExampleCo",
          email: "first.last@example.test",
        }),
      ],
    });

    await user.click(screen.getByRole("button", { name: "Google Calendar" }));

    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining("https://calendar.google.com/calendar/render?"),
      "_blank",
      "noopener,noreferrer",
    );
    expect(new URL(openSpy.mock.calls[0][0] as string).searchParams.getAll("add")).toEqual([
      "first.last@example.test",
    ]);
    expect(screen.getByText("Google Calendar opened")).toBeInTheDocument();

    openSpy.mockRestore();
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

  it("adds a custom integration via the Other field", async () => {
    const user = userEvent.setup();
    const onAddPlatformOption = vi.fn();

    renderHarness(
      {
        ...createEmptyInteractionDraft(),
        companyName: "ExampleDb",
      },
      vi.fn(),
      onAddPlatformOption,
    );

    const integrationGroup = screen.getByRole("group", { name: "Integration interest" });
    await user.click(within(integrationGroup).getByRole("button", { name: "Other" }));
    await user.type(screen.getByPlaceholderText("Add an integration"), "oracle");
    await user.click(screen.getByRole("button", { name: "Add integration" }));

    expect(onAddPlatformOption).toHaveBeenCalledWith("oracle");
    expect(screen.getByRole("checkbox", { name: "oracle" })).toBeChecked();
  });
});
