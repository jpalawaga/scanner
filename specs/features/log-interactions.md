# Log Interactions

Interaction logging starts with QR scanning and finishes on the Add Interaction screen.

## Current Entry Point

- The Home screen includes a full-width `Record new interaction` button near the top of the screen.
- The button opens the Scan QR Code screen.

## QR Scanning

- Scanner uses `@zxing/browser` to decode QR codes from the device camera.
- Camera scanning requests the environment-facing camera when the browser can provide one.
- The scan screen also accepts uploaded image files and decodes QR content from the image.
- If the browser has no camera support or permission is denied, the scan screen keeps the upload fallback available.
- A successful scan parses the QR payload and opens Add Interaction.
- Participant scans from Add Interaction use the same scanner and merge the scanned participant into the existing draft.

## QR Payload Parsing

Scanner attempts to populate company, participants, and contact records from these QR payload shapes:

- vCard payloads with `FN`, `N`, `ORG`, and optional `EMAIL` fields.
- JSON payloads with company fields such as `companyName`, `company`, `organization`, or `org`, participant fields such as `name`, `firstName` plus `lastName`, or a `participants` array, and optional email fields such as `email`.
- URL payloads with query parameters such as `company`, `org`, `name`, `firstName`, `lastName`, and optional `email`.
- Caret-delimited badge payloads in the form `<junk>^first^last^company^`, such as `0000000000000000test^First^Last^ExampleCo^`.
- Plain text key/value payloads using `:` or `=` separators.
- A single non-URL plain text value is treated as one participant name.

When a payload cannot be parsed, Add Interaction still opens with empty editable fields.

## Add Interaction

The Add Interaction screen allows the user to review and edit the draft before saving.

- Header contains a Back button and `New Interaction` heading.
- Company name is the first form field and is required before `Done` or `Add to calendar` can be used.
- Participants appear as contact tiles. Each tile shows first and last name, company name, an email textbox, and a remove button.
- The participants section has a `Scan` button for adding another participant from a QR code.
- Feature interests are selectable pill-style checkboxes for `ETL`, `rETL`, `ipass`, `API`, `terraform`, `CDC`, and `on prem`.
- Platform interest is a searchable checkbox list.
- Selecting a platform clears the platform search field.
- The `+` button adds the current search text as a custom lowercased platform option and selects it.
- Custom platform options persist and appear in future platform lists.

## Email Enrichment

- Email textboxes are manual entry fields today.
- Browser-side Apollo enrichment is not shipped.
- A direct browser request to Apollo would expose the Apollo API key in the shipped JavaScript bundle.
- Apollo matching also requires a custom `X-Api-Key` header and JSON body, so direct browser calls depend on Apollo allowing the app origin through CORS preflight.
- Email enrichment should be implemented through a server-side proxy or serverless function that holds the Apollo API key outside the browser and returns only the matched email data needed by Scanner.

## Calendar Export

- `Google Calendar` opens a Google Calendar event creation link with meeting title, event time, details, and participants.
- Contact emails are passed as Google Calendar guests when present.
- `Download .ics` creates an `.ics` file with meeting title, contact names/emails, feature interests, and platform interests.
- The event defaults to the next half-hour boundary and lasts 30 minutes.
- On mobile browsers, the Google Calendar link relies on the browser and installed Google account session to finish event creation.
- Opening Google Calendar or downloading the `.ics` file marks the draft as having a meeting scheduled; saved interactions with that marker show the calendar icon on Home.

## Saving

- `Done` is enabled when the company name is non-empty.
- Saving creates a new interaction with the current timestamp, normalized contacts, participant summary names, selected features, selected platform interests, and meeting marker.
- The saved interaction is written to local storage and Home is shown again.
- Home lists saved interactions reverse chronologically.
