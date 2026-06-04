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
  const title = `Meeting with ${draft.companyName.trim() || "new contact"}`;
  const participantDetails = getParticipantDetails(draft);
  const descriptionParts = [
    participantDetails.length > 0 ? `Participants: ${participantDetails.join(", ")}` : "",
    draft.features.length > 0 ? `Features: ${draft.features.join(", ")}` : "",
    draft.platformInterests.length > 0 ? `Platforms: ${draft.platformInterests.join(", ")}` : "",
  ].filter(Boolean);

  return {
    startsAt,
    endsAt,
    title,
    descriptionParts,
    guestEmails: getGuestEmails(draft.contacts),
  };
}

function getParticipantDetails(draft: InteractionDraft) {
  if (draft.contacts.length === 0) {
    return normalizeStringList(draft.participants);
  }

  return draft.contacts.map((contact) => {
    const contactName = getContactDisplayName(contact) || "Unnamed contact";

    return contact.email ? `${contactName} <${contact.email}>` : contactName;
  });
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
