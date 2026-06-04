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

Scanner attempts to populate company and participants from these QR payload shapes:

- vCard payloads with `FN`, `N`, and `ORG` fields.
- JSON payloads with company fields such as `companyName`, `company`, `organization`, or `org`, and participant fields such as `name`, `firstName` plus `lastName`, or a `participants` array.
- URL payloads with query parameters such as `company`, `org`, `name`, `firstName`, and `lastName`.
- Plain text key/value payloads using `:` or `=` separators.
- A single non-URL plain text value is treated as one participant name.

When a payload cannot be parsed, Add Interaction still opens with empty editable fields.

## Add Interaction

The Add Interaction screen allows the user to review and edit the draft before saving.

- Header contains a Back button and `New Interaction` heading.
- Company name is the first form field and is required before `Done` or `Add to calendar` can be used.
- Participants appear as editable rows. Each row has a remove button.
- The participants section has a `Scan` button for adding another participant from a QR code.
- Feature interests are selectable pill-style checkboxes for `ETL`, `rETL`, `ipass`, `API`, `terraform`, `CDC`, and `on prem`.
- Platform interest is a searchable checkbox list.
- Selecting a platform clears the platform search field.
- The `+` button adds the current search text as a custom lowercased platform option and selects it.
- Custom platform options persist and appear in future platform lists.

## Calendar Export

- `Add to calendar` creates an `.ics` file with meeting title, participants, feature interests, and platform interests.
- The event defaults to the next half-hour boundary and lasts 30 minutes.
- On mobile browsers, opening or downloading the `.ics` file relies on the operating system/browser to hand the file to a calendar app.
- Creating the calendar file marks the draft as having a meeting scheduled; saved interactions with that marker show the calendar icon on Home.

## Saving

- `Done` is enabled when the company name is non-empty.
- Saving creates a new interaction with the current timestamp, normalized participants, selected features, selected platform interests, and meeting marker.
- The saved interaction is written to local storage and Home is shown again.
- Home lists saved interactions reverse chronologically.
