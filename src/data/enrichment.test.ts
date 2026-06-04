import { describe, expect, it } from "vitest";
import { extractEnrichedEmail } from "./enrichment";

// NOTE: all fixtures below are synthetic. Do not paste real Apollo responses
// (which contain PII) into this repo.

describe("extractEnrichedEmail", () => {
  it("reads the top-level person.email and email_status", () => {
    const payload = {
      person: {
        first_name: "Ada",
        last_name: "Lovelace",
        email: "ada@example.com",
        email_status: "verified",
      },
      request_id: 1,
    };

    expect(extractEnrichedEmail(payload)).toEqual({
      email: "ada@example.com",
      emailStatus: "verified",
    });
  });

  it("ignores the nested contact.email and uses person.email", () => {
    const payload = {
      person: {
        email: "real@example.com",
        email_status: "verified",
        contact: { email: "throwaway@mail-tester.example" },
      },
    };

    expect(extractEnrichedEmail(payload)?.email).toBe("real@example.com");
  });

  it("returns null for the unlocked-email placeholder", () => {
    const payload = {
      person: { email: "email_not_unlocked@domain.com", email_status: "unavailable" },
    };

    expect(extractEnrichedEmail(payload)).toBeNull();
  });

  it("returns null when there is no person match", () => {
    expect(extractEnrichedEmail({ person: null })).toBeNull();
    expect(extractEnrichedEmail({})).toBeNull();
  });

  it("returns null for malformed input", () => {
    expect(extractEnrichedEmail(null)).toBeNull();
    expect(extractEnrichedEmail("nope")).toBeNull();
    expect(extractEnrichedEmail({ person: { email: 42 } })).toBeNull();
  });

  it("defaults email_status to an empty string when absent", () => {
    const payload = { person: { email: "grace@example.com" } };

    expect(extractEnrichedEmail(payload)).toEqual({
      email: "grace@example.com",
      emailStatus: "",
    });
  });
});
