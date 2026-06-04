# App Overview

Scanner is a React and Vite single-page app with a mobile-first shell. The root app owns a lightweight view state machine instead of a URL router.

## Current Shell

- `index.html` mounts React into `#root`.
- `src/main.tsx` creates the React root and renders `App`.
- `src/App.tsx` owns the current view, saved interactions, and custom platform options.
- There is no URL router yet.
- The global stylesheet imports Tailwind CSS and sets light-mode base typography.
- The Vite production build writes generated assets to `docs/`.
- The QR decoding library is loaded on demand by the scan screen instead of being included in the initial Home bundle.

## Views

The app has three top-level views:

- `HomeScreen`: lists saved interactions, filters them by company or participant, and starts the QR scan flow.
- `ScanScreen`: opens the device camera for QR decoding and also accepts uploaded badge photos.
- `AddInteractionScreen`: edits the scanned interaction draft, creates a calendar file, and saves the interaction.

## Flow

1. Home `Record new interaction` opens the scanner in new-interaction mode.
2. A successful scan parses the QR payload and opens Add Interaction with company and participant fields populated when the payload contains those values.
3. Add Interaction `Scan` in the participants section reopens the scanner in participant mode.
4. A participant scan merges the parsed participant into the existing draft and returns to Add Interaction.
5. Add Interaction `Done` persists the interaction and returns to Home.
6. Back from the scanner returns to Home for a new scan or back to Add Interaction for a participant scan.

## Branding

- The product name is `Scanner`.

## Build Metadata

The Vite config defines two build-time constants:

- `__APP_BUILD_VERSION__`: the package version prefixed with `v`.
- `__APP_BUILD_STAMP__`: the UTC build timestamp to minute precision.

The Home footer displays both values.

## Current Product Boundaries

- Scanner supports creating interactions through QR scanning and saving them locally.
- Interaction detail and editing after save are not implemented.
- Import, export, backup, and multi-device sync are not implemented.
