import { describe, expect, it } from "vitest";
import { createCalendarEventFile, createGoogleCalendarUrl } from "./calendar";
import { createEmptyInteractionDraft, createInteractionContact } from "./data/interactions";

describe("createCalendarEventFile", () => {
  it("includes meeting title and escaped details", () => {
    const calendarFile = createCalendarEventFile({
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
      features: ["ETL"],
      platformInterests: ["snowflake"],
    });

    expect(calendarFile).toContain("BEGIN:VCALENDAR");
    expect(calendarFile).toContain("SUMMARY:Meeting with ExampleCo");
    expect(calendarFile).toContain("Participants: First Last <first.last@example.test>\\nFeatures: ETL\\nPlatforms: snowflake");
  });

  it("creates a Google Calendar URL with participants as guests", () => {
    const calendarUrl = createGoogleCalendarUrl({
      ...createEmptyInteractionDraft(),
      companyName: "ExampleCo",
      contacts: [
        createInteractionContact({
          firstName: "First",
          lastName: "Last",
          companyName: "ExampleCo",
          email: "first.last@example.test",
        }),
        createInteractionContact({
          firstName: "Second",
          lastName: "Contact",
          companyName: "ExampleCo",
          email: "second.contact@example.test",
        }),
      ],
      features: ["ETL"],
      platformInterests: ["snowflake"],
    });
    const parsedUrl = new URL(calendarUrl);

    expect(parsedUrl.origin).toBe("https://calendar.google.com");
    expect(parsedUrl.pathname).toBe("/calendar/render");
    expect(parsedUrl.searchParams.get("action")).toBe("TEMPLATE");
    expect(parsedUrl.searchParams.get("text")).toBe("Meeting with ExampleCo");
    expect(parsedUrl.searchParams.get("details")).toBe(
      "Participants: First Last <first.last@example.test>, Second Contact <second.contact@example.test>\nFeatures: ETL\nPlatforms: snowflake",
    );
    expect(parsedUrl.searchParams.get("dates")).toMatch(/^\d{8}T\d{6}Z\/\d{8}T\d{6}Z$/);
    expect(parsedUrl.searchParams.getAll("add")).toEqual([
      "first.last@example.test",
      "second.contact@example.test",
    ]);
  });
});
