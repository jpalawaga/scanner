# Home

The Home screen is the first shipped Scanner screen and the app's current landing view.

## Layout

- The screen uses a mobile-first utility layout with a quiet SaaS visual style.
- Content sits in a single centered column with a maximum width for larger viewports.
- The page header shows the product name `Scanner` above the screen title `Interactions`.
- A full-width `Record new interaction` button appears directly below the header. The button is visually present and disabled because interaction creation is not implemented yet.
- A search field appears below the disabled action button. The field is labeled for assistive technology as `Search interactions` and uses the placeholder `Search company or participant`.
- The interaction list area fills the remaining vertical space below search.
- A small footer shows the build version and UTC build stamp.

## Interaction Data

Home renders interaction records with these fields:

- `id`: stable unique identifier.
- `companyName`: primary tile title.
- `participants`: ordered participant names for the subtitle.
- `date`: date string used for the right-aligned tile date.
- `meetingSet`: boolean that controls whether the meeting calendar icon appears.

The running app currently provides an empty interaction collection. The Home screen component can render supplied interactions for tests and future data integration.

## Empty State

When no interactions are available, the list area shows an empty state:

- Heading: `No interactions yet`.
- Body: `Recorded conversations will appear here once interaction logging is available.`

The empty state remains visible even if the user types a search query while the app has no interactions.

## Search

- Search is client-side and case-insensitive.
- Search input is trimmed before matching.
- Search matches only company names and participant names.
- If interactions exist but none match the current search query, the empty state changes to:
  - Heading: `No matches found`.
  - Body: `Try searching by company name or participant.`

## Interaction List

When interactions are supplied, Home displays them as a full-width tile list.

- Each tile shows the company name on the first line.
- The second line shows participants as a comma-separated string and truncates when it overflows.
- If no participants are present, the subtitle reads `No participants listed`.
- The right side of the tile shows a compact month/day date, such as `Jun 1`.
- If `meetingSet` is true, a calendar icon appears immediately before the date with the accessible label `Meeting scheduled`.
- The list preserves the order supplied by the data source. Reverse chronological ordering is a data-source responsibility until persistence and sorting are implemented.
