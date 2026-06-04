import {
  getContactDisplayName,
  normalizeStringList,
  type InteractionContact,
  type InteractionDraft,
} from "./data/interactions";

type CalendarEventDetails = {
  startsAt: Date;
  endsAt: Date;
  title: string;
  descriptionParts: string[];
  guestEmails: string[];
};

export function createCalendarEventFile(draft: InteractionDraft) {
  const eventDetails = createCalendarEventDetails(draft);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Scanner//Interactions//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${createEventId()}`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(eventDetails.startsAt)}`,
    `DTEND:${formatIcsDate(eventDetails.endsAt)}`,
    `SUMMARY:${escapeIcsText(eventDetails.title)}`,
    `DESCRIPTION:${escapeIcsText(eventDetails.descriptionParts.join("\n"))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function createGoogleCalendarUrl(draft: InteractionDraft) {
  const eventDetails = createCalendarEventDetails(draft);
  const searchParams = new URLSearchParams({
    action: "TEMPLATE",
    text: eventDetails.title,
    dates: `${formatGoogleCalendarDate(eventDetails.startsAt)}/${formatGoogleCalendarDate(eventDetails.endsAt)}`,
    details: eventDetails.descriptionParts.join("\n"),
  });

  for (const email of eventDetails.guestEmails) {
    searchParams.append("add", email);
  }

  return `https://calendar.google.com/calendar/render?${searchParams.toString()}`;
}

function createCalendarEventDetails(draft: InteractionDraft): CalendarEventDetails {
  const startsAt = roundToNextHalfHour(new Date());
  const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000);

  const company = draft.companyName.trim() || "your team";
  const features = normalizeStringList(draft.features);
  const platforms = normalizeStringList(draft.platformInterests).map(capitalize);

  return {
    startsAt,
    endsAt,
    title: buildTitle(company, features[0], platforms[0]),
    descriptionParts: buildDescription(draft, features, platforms),
    guestEmails: getGuestEmails(draft.contacts),
  };
}

// e.g. "Polytomic / Acme: ETL w/ Snowflake"
function buildTitle(company: string, feature?: string, platform?: string) {
  let title = `Polytomic / ${company}`;

  if (feature) {
    title += `: ${feature}`;

    if (platform) {
      title += ` w/ ${platform}`;
    }
  }

  return title;
}

function buildDescription(draft: InteractionDraft, features: string[], platforms: string[]) {
  const greetingName = getGreetingName(draft);
  const topics = buildTopicsClause(features, platforms);

  return [
    `Hi ${greetingName},`,
    "",
    `Great connecting! It was good to chat${topics}. I'd love to grab some time to walk` +
      " you through more of what Polytomic can do and to understand your needs a bit better.",
    "",
    "Would something in the next week or two work? Looking forward to it.",
  ];
}

function buildTopicsClause(features: string[], platforms: string[]) {
  const featurePhrase = joinNatural(features);
  const platformPhrase = joinNatural(platforms);

  if (featurePhrase && platformPhrase) {
    return ` about ${featurePhrase} with ${platformPhrase}`;
  }

  if (featurePhrase) {
    return ` about ${featurePhrase}`;
  }

  if (platformPhrase) {
    return ` about your ${platformPhrase} setup`;
  }

  return "";
}

function getGreetingName(draft: InteractionDraft) {
  const names = draft.contacts.map(getContactDisplayName).filter(Boolean);

  return names.length === 1 ? names[0].split(" ")[0] : "there";
}

function joinNatural(items: string[]) {
  if (items.length <= 1) {
    return items[0] ?? "";
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase() + value.slice(1);
}

function getGuestEmails(contacts: InteractionContact[]) {
  return normalizeStringList(contacts.map((contact) => contact.email));
}

export function downloadCalendarEvent(draft: InteractionDraft) {
  const calendarFile = createCalendarEventFile(draft);
  const blob = new Blob([calendarFile], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${slugify(draft.companyName || "scanner-meeting")}.ics`;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function formatIcsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function formatGoogleCalendarDate(date: Date) {
  return formatIcsDate(date);
}

function roundToNextHalfHour(date: Date) {
  const rounded = new Date(date);
  const minutes = rounded.getMinutes();
  const minutesToAdd = minutes === 0 || minutes === 30 ? 0 : minutes < 30 ? 30 - minutes : 60 - minutes;

  rounded.setMinutes(minutes + minutesToAdd, 0, 0);

  return rounded;
}

function escapeIcsText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function slugify(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function createEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${crypto.randomUUID()}@scanner.local`;
  }

  return `scanner-${Date.now()}@scanner.local`;
}
