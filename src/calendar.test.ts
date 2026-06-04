import { describe, expect, it } from "vitest";
import { createCalendarEventFile } from "./calendar";
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
});
