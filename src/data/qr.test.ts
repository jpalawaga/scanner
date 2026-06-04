import { describe, expect, it } from "vitest";
import { parseQrContact } from "./qr";

describe("parseQrContact", () => {
  it("reads company and participant from vCard QR content", () => {
    expect(
      parseQrContact(["BEGIN:VCARD", "VERSION:3.0", "FN:First Last", "ORG:ExampleCo", "END:VCARD"].join("\n")),
    ).toMatchObject({
      companyName: "ExampleCo",
      participants: ["First Last"],
    });
  });

  it("reads company and participant from URL query content", () => {
    expect(
      parseQrContact("https://event.example/badge?firstName=First&lastName=Last&company=Snowflake"),
    ).toMatchObject({
      companyName: "Snowflake",
      participants: ["First Last"],
    });
  });

  it("reads direct JSON and participant arrays", () => {
    expect(
      parseQrContact(
        JSON.stringify({
          companyName: "Databricks",
          participants: [{ firstName: "Second", lastName: "Contact" }],
        }),
      ),
    ).toMatchObject({
      companyName: "Databricks",
      participants: ["Second Contact"],
    });
  });
});
