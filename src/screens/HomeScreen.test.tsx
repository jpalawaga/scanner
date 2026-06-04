import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Interaction } from "../data/interactions";
import { HomeScreen } from "./HomeScreen";

const buildInteraction = (overrides: Partial<Interaction> = {}): Interaction => ({
  id: "interaction-1",
  companyName: "Acme Corp",
  participants: ["First Contact", "Second Contact"],
  contacts: [],
  date: "2026-06-03T09:30:00.000Z",
  meetingSet: false,
  features: [],
  platformInterests: [],
  ...overrides,
});

describe("HomeScreen", () => {
  it("shows an empty state and starts the scan flow from the record button", async () => {
    const user = userEvent.setup();
    const onNewInteraction = vi.fn();

    render(<HomeScreen interactions={[]} onNewInteraction={onNewInteraction} />);

    expect(screen.getByRole("heading", { name: "Interactions" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record new interaction" })).toBeEnabled();
    expect(screen.getByText("No interactions yet")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search company or participant")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Record new interaction" }));

    expect(onNewInteraction).toHaveBeenCalledTimes(1);
  });

  it("renders interaction tiles with company, participants, date, and meeting marker", () => {
    render(
      <HomeScreen
        onNewInteraction={vi.fn()}
        interactions={[
          buildInteraction({
            id: "interaction-1",
            companyName: "Snowflake",
            participants: ["First Last", "Second Contact"],
            date: "2026-06-01T14:00:00.000Z",
            meetingSet: true,
          }),
        ]}
      />,
    );

    const list = screen.getByRole("list");
    expect(within(list).getByText("Snowflake")).toBeInTheDocument();
    expect(within(list).getByText("First Last, Second Contact")).toBeInTheDocument();
    expect(within(list).getByText("Jun 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Meeting scheduled")).toBeInTheDocument();
  });

  it("filters interactions by company and participant names", async () => {
    const user = userEvent.setup();

    render(
      <HomeScreen
        onNewInteraction={vi.fn()}
        interactions={[
          buildInteraction({
            id: "interaction-1",
            companyName: "Snowflake",
            participants: ["First Last"],
          }),
          buildInteraction({
            id: "interaction-2",
            companyName: "Databricks",
            participants: ["Second Contact"],
          }),
        ]}
      />,
    );

    await user.type(screen.getByPlaceholderText("Search company or participant"), "jordan");

    expect(screen.getByText("Databricks")).toBeInTheDocument();
    expect(screen.queryByText("Snowflake")).not.toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText("Search company or participant"));
    await user.type(screen.getByPlaceholderText("Search company or participant"), "snow");

    expect(screen.getByText("Snowflake")).toBeInTheDocument();
    expect(screen.queryByText("Databricks")).not.toBeInTheDocument();
  });
});
