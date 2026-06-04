import { describe, expect, it } from "vitest";
import { platformMatchesQuery } from "./interactions";

describe("platformMatchesQuery", () => {
  it("matches on substring", () => {
    expect(platformMatchesQuery("Snowflake", "snow")).toBe(true);
    expect(platformMatchesQuery("Google BigQuery", "bigquery")).toBe(true);
    expect(platformMatchesQuery("Snowflake", "flake")).toBe(true);
  });

  it("matches word-initial acronyms", () => {
    expect(platformMatchesQuery("Microsoft SQL Server", "mss")).toBe(true);
    expect(platformMatchesQuery("Google Cloud Storage", "gcs")).toBe(true);
    expect(platformMatchesQuery("Google Search Console", "gsc")).toBe(true);
  });

  it("matches common abbreviations via aliases", () => {
    expect(platformMatchesQuery("PostgreSQL", "psql")).toBe(true);
    expect(platformMatchesQuery("Google Cloud PostgreSQL", "psql")).toBe(true);
    expect(platformMatchesQuery("Microsoft Ads", "ms")).toBe(true);
    expect(platformMatchesQuery("Microsoft Dynamics 365", "ms")).toBe(true);
    expect(platformMatchesQuery("Salesforce", "sfdc")).toBe(true);
  });

  it("does not match unrelated options", () => {
    expect(platformMatchesQuery("Snowflake", "psql")).toBe(false);
    expect(platformMatchesQuery("Stripe", "ms")).toBe(false);
    expect(platformMatchesQuery("Airtable", "mss")).toBe(false);
  });

  it("matches everything for an empty query", () => {
    expect(platformMatchesQuery("Anything", "")).toBe(true);
  });
});
