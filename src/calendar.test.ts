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
    expect(calendarFile).toContain("SUMMARY:Polytomic / ExampleCo: ETL w/ Snowflake");
    expect(calendarFile).toContain("Hi First");
    expect(calendarFile).toContain("chat about ETL with Snowflake");
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
    expect(parsedUrl.searchParams.get("text")).toBe("Polytomic / ExampleCo: ETL w/ Snowflake");

    const details = parsedUrl.searchParams.get("details") ?? "";
    expect(details).toContain("Hi there,");
    expect(details).toContain("chat about ETL with Snowflake");
    expect(details).toContain("Polytomic can do");

    expect(parsedUrl.searchParams.get("dates")).toMatch(/^\d{8}T\d{6}Z\/\d{8}T\d{6}Z$/);
    expect(parsedUrl.searchParams.getAll("add")).toEqual([
      "first.last@example.test",
      "second.contact@example.test",
    ]);
  });
});
