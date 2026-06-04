# Common UI Components

Scanner does not yet have a shared component library. The current UI is implemented directly in the Home screen.

## Current Patterns

- Buttons use 8px border radius or less.
- Icons come from `lucide-react`.
- The UI uses light backgrounds, restrained borders, and slate text colors.
- Form controls keep stable touch-friendly heights for mobile use.
- Text truncates inside interaction tiles instead of resizing the layout.

Any future shared component extraction must update this document with component names, props, states, and accessibility expectations.
