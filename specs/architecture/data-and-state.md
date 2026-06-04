# Data and State

Scanner stores saved interactions and custom platform options in browser `localStorage`. Unsaved interaction drafts live in React state.

## Interaction Model

Saved interactions use this TypeScript shape:

```ts
type Interaction = {
  id: string;
  companyName: string;
  participants: string[];
  date: string;
  meetingSet: boolean;
  features: FeatureInterest[];
  platformInterests: string[];
};
```

Feature interests are fixed to:

- `ETL`
- `rETL`
- `ipass`
- `API`
- `terraform`
- `CDC`
- `on prem`

Default platform options are:

- `snowflake`
- `databricks`
- `bigquery`
- `ms sql`
- `mysql`
- `postgres`
- `salesforce`
- `sap`
- `db2`
- `s3`

## Draft Model

The Add Interaction flow uses an unsaved draft:

```ts
type InteractionDraft = {
  companyName: string;
  participants: string[];
  features: FeatureInterest[];
  platformInterests: string[];
  calendarEventCreated: boolean;
  scannedRawCodes: string[];
};
```

`scannedRawCodes` is retained only while editing the draft. It is not stored on the saved interaction.

## Current Data Source

- Saved interactions are loaded from `scanner.interactions.v1`.
- Custom platform options are loaded from `scanner.customPlatformOptions.v1`.
- If storage is unavailable, invalid, or empty, the app starts with empty lists.
- Home receives the loaded interaction array from `App`.
- Saved interactions are sorted reverse chronologically by `date`.

## Current State

- Home owns one piece of UI state: the search query.
- The normalized query is trimmed and lowercased before filtering.
- Filtering is derived in render from the provided interactions and does not mutate data.
- App owns the active view, saved interactions, and custom platform options.
- Add Interaction owns transient UI state for platform search text and calendar creation status.

## Persistence

- `scanner.interactions.v1` stores the full saved interaction array as JSON.
- `scanner.customPlatformOptions.v1` stores custom platform option strings as JSON.
- Writes happen when an interaction is saved or a custom platform option is added.
- Interaction IDs are generated with `crypto.randomUUID()` when available and fall back to a timestamp/random suffix.
- Saving normalizes participant and platform lists by trimming values, removing blanks, and removing duplicates.
- Custom platform options are lowercased and stored only when they are not part of the default platform list.

## Compatibility

- IndexedDB is not initialized.
- There are no migrations.
- There is no backup, restore, or offline data queue.
- The current storage contract is versioned by key name with `.v1`.
- Unknown, malformed, or incompatible stored entries are ignored instead of crashing app startup.
- Future schema changes must add migration behavior or write to a new versioned storage key.
