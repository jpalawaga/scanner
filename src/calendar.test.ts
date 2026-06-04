import { describe, expect, it } from "vitest";
import { createCalendarEventFile } from "./calendar";
import { createEmptyInteractionDraft } from "./data/interactions";

describe("createCalendarEventFile", () => {
  it("includes meeting title and escaped details", () => {
    const calendarFile = createCalendarEventFile({
      ...createEmptyInteractionDraft(),
      companyName: "ExampleCo",
      participants: ["First Last"],
      features: ["ETL"],
      platformInterests: ["snowflake"],
    });

    expect(calendarFile).toContain("BEGIN:VCALENDAR");
    expect(calendarFile).toContain("SUMMARY:Meeting with ExampleCo");
    expect(calendarFile).toContain("Participants: First Last\\nFeatures: ETL\\nPlatforms: snowflake");
  });
});
