# Data and State

Scanner currently has only local component state and an empty in-memory interaction collection.

## Interaction Model

The Home screen renders interaction-like records with this TypeScript shape:

```ts
type Interaction = {
  id: string;
  companyName: string;
  participants: string[];
  date: string;
  meetingSet: boolean;
};
```

## Current Data Source

- `src/data/interactions.ts` exports an empty `interactions` array.
- The running app passes no persisted data into Home, so the user sees the empty state.
- `HomeScreen` accepts an optional `interactions` prop for tests and future integration.

## Current State

- Home owns one piece of UI state: the search query.
- The normalized query is trimmed and lowercased before filtering.
- Filtering is derived in render from the provided interactions and does not mutate data.

## Persistence

No persistence exists in the shipped app yet.

- IndexedDB is not initialized.
- There are no migrations.
- There is no backup, restore, or offline data queue.

Future persistence work must update this document with storage location, schema versioning, migration behavior, and compatibility guarantees.
