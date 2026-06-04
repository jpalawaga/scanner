# Add Interaction

Add Interaction is the review and edit screen for a scanned interaction draft.

## Header

- The header has a Back button on the left.
- The centered heading is `New Interaction`.
- Back returns to Home and does not save the draft.

## Company

- Company name is the first field.
- QR parsing can prefill the company from vCard, JSON, URL query parameters, or text key/value content.
- The field is editable.
- `Done` and `Add to calendar` require a non-empty company name.

## Participants

- Participants appear immediately below company.
- QR parsing can prefill one or more participants.
- Each participant row is editable and has a remove button.
- If no participants are present, the section shows `No participants scanned.`
- The section has a `Scan` button that opens the scanner in participant mode.
- Successful participant scans merge parsed participants into the current draft and return to Add Interaction.

## Features Of Interest

Feature interests are selectable pill-style checkboxes.

Options:

- `ETL`
- `rETL`
- `ipass`
- `API`
- `terraform`
- `CDC`
- `on prem`

Selecting an option toggles it on or off.

## Platform Interest

- Platform interest is a searchable checkbox list.
- Default options are `snowflake`, `databricks`, `bigquery`, `ms sql`, `mysql`, `postgres`, `salesforce`, `sap`, `db2`, and `s3`.
- Search filters the visible list case-insensitively.
- Selecting or clearing a platform checkbox clears the search text.
- The `+` button adds the current search text as a custom lowercased platform option and selects it.
- Custom platform options persist and appear in later Add Interaction flows.
- Selected custom platforms remain visible immediately after being added.

## Calendar

- `Add to calendar` creates and downloads an `.ics` file.
- The title is `Meeting with {companyName}`.
- The description includes participants, feature interests, and platform interests when present.
- The event starts at the next half-hour boundary and lasts 30 minutes.
- Creating the file marks the draft as having a meeting scheduled.
- Saved interactions with a meeting scheduled show the calendar icon on Home.

## Done

- `Done` saves the interaction when the company name is non-empty.
- Saving trims company, participant, and platform values.
- Blank participant/platform values are removed.
- Duplicate participant/platform values are removed.
- The new interaction is timestamped at save time, persisted, and Home is shown again.
