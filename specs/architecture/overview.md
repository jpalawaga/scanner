# App Overview

Scanner is a React and Vite single-page app with a mobile-first shell. The first shipped route is the root app view, which renders the Home screen directly.

## Current Shell

- `index.html` mounts React into `#root`.
- `src/main.tsx` creates the React root and renders `App`.
- `src/App.tsx` renders `HomeScreen`.
- There is no router yet.
- There is no navigation yet.
- The global stylesheet imports Tailwind CSS and sets light-mode base typography.
- The Vite production build writes generated assets to `docs/`.

## Branding

- The product name is `Scanner`.

## Build Metadata

The Vite config defines two build-time constants:

- `__APP_BUILD_VERSION__`: the package version prefixed with `v`.
- `__APP_BUILD_STAMP__`: the UTC build timestamp to minute precision.

The Home footer displays both values.

## Current Product Boundaries

- Scanner currently ships only the Home screen.
- Interaction creation is represented by a disabled button.
- Interaction detail, editing, routing, import, export, and persistence are not implemented.
