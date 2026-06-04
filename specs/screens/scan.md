# Scan QR Code

The Scan QR Code screen captures QR content from a badge and routes the parsed result into Add Interaction.

## Layout

- The screen uses the same mobile-first centered column as Home.
- The header has a Back button on the left and a centered heading.
- The heading is `Scan QR code` for a new interaction and `Scan participant` when adding another participant.
- The main body contains a live camera preview with a square scan frame overlay.
- A status panel below the preview shows the camera/scanning state.
- An `Upload badge photo` control accepts image files as a fallback.

## Camera Behavior

- Scanner uses `@zxing/browser` and `BrowserQRCodeReader`.
- Camera scanning starts when the screen mounts.
- The scanner requests the environment-facing camera by default.
- When a QR code is detected, scanning stops and the raw text is sent to the app flow.
- Leaving the screen stops active scanner controls.
- If camera access is unavailable or blocked, the screen reports `Camera unavailable`.

## Upload Fallback

- Uploaded image files are decoded with the same QR reader.
- If a QR code is found, the raw text is handled exactly like a camera scan.
- If no QR code is found, the screen reports `No QR code was found in that image.`

## Back Behavior

- Back from a new-interaction scan returns to Home.
- Back from a participant scan returns to Add Interaction with the current draft unchanged.
