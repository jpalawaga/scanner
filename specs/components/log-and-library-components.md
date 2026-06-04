# Log and Library Components

The current app has no reusable log or library components.

## Home Interaction Tile

Home currently implements interaction tiles inline.

- Company name is the primary line.
- Participants are the secondary line.
- Date and meeting status are aligned on the right.
- Meeting status uses a calendar icon with the accessible label `Meeting scheduled`.

If the tile is extracted into a reusable component, this document must be updated with the component contract and any shared variants.

## Scanner Preview

The scanner preview is currently implemented inline in the Scan QR Code screen.

- It displays the camera video feed.
- It uses a square scan frame overlay.
- It exposes the video element with the accessible label `QR camera preview`.
- Upload fallback is a styled file input label.

## Add Interaction Controls

The Add Interaction form currently implements these controls inline:

- Editable company input.
- Editable participant rows with remove icon buttons.
- Feature interest pill checkboxes.
- Platform search, add button, and checkbox list.
- Calendar export and Done action buttons.
