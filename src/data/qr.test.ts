import { describe, expect, it } from "vitest";
import { parseQrContact } from "./qr";

describe("parseQrContact", () => {
  it("reads company and participant from caret-delimited badge content", () => {
    expect(parseQrContact("0000000000000000test^First^Last^ExampleCo^")).toMatchObject({
      companyName: "ExampleCo",
      participants: ["First Last"],
      contacts: [
        {
          firstName: "First",
          lastName: "Last",
          companyName: "ExampleCo",
          email: "",
        },
      ],
    });
  });

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
      parseQrContact("https://event.example/badge?firstName=First&lastName=Last&company=ExampleCo"),
    ).toMatchObject({
      companyName: "ExampleCo",
      participants: ["First Last"],
    });
  });

  it("reads direct JSON and participant arrays", () => {
    expect(
      parseQrContact(
        JSON.stringify({
          companyName: "ExampleCo",
          participants: [{ firstName: "First", lastName: "Last" }],
        }),
      ),
    ).toMatchObject({
      companyName: "ExampleCo",
      participants: ["First Last"],
    });
  });
});
