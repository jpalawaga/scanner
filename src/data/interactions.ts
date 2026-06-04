export const FEATURE_OPTIONS = [
  "ETL",
  "rETL",
  "ipass",
  "API",
  "terraform",
  "CDC",
  "on prem",
] as const;

export const DEFAULT_PLATFORM_OPTIONS = [
  "snowflake",
  "databricks",
  "bigquery",
  "ms sql",
  "mysql",
  "postgres",
  "salesforce",
  "sap",
  "db2",
  "s3",
] as const;

export type FeatureInterest = (typeof FEATURE_OPTIONS)[number];

export type InteractionContact = {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
};

export type Interaction = {
  id: string;
  companyName: string;
  participants: string[];
  contacts: InteractionContact[];
  date: string;
  meetingSet: boolean;
  features: FeatureInterest[];
  platformInterests: string[];
};

export type InteractionDraft = {
  companyName: string;
  participants: string[];
  contacts: InteractionContact[];
  features: FeatureInterest[];
  platformInterests: string[];
  calendarEventCreated: boolean;
  scannedRawCodes: string[];
};

export const interactions: Interaction[] = [];

export function createEmptyInteractionDraft(): InteractionDraft {
  return {
    companyName: "",
    participants: [],
    contacts: [],
    features: [],
    platformInterests: [],
    calendarEventCreated: false,
    scannedRawCodes: [],
  };
}

export function createInteractionFromDraft(draft: InteractionDraft): Interaction {
  const contacts = normalizeContacts(draft.contacts);

  return {
    id: createInteractionId(),
    companyName: draft.companyName.trim(),
    participants: normalizeStringList([...draft.participants, ...contacts.map(getContactDisplayName)]),
    contacts,
    date: new Date().toISOString(),
    meetingSet: draft.calendarEventCreated,
    features: draft.features,
    platformInterests: normalizeStringList(draft.platformInterests),
  };
}

export function createInteractionContact({
  firstName = "",
  lastName = "",
  companyName = "",
  email = "",
}: Partial<Omit<InteractionContact, "id">>): InteractionContact {
  return {
    id: createInteractionId(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    companyName: companyName.trim(),
    email: email.trim(),
  };
}

export function normalizeContacts(contacts: InteractionContact[]) {
  const seenContacts = new Set<string>();

  return contacts
    .map((contact) => ({
      ...contact,
      firstName: contact.firstName.trim(),
      lastName: contact.lastName.trim(),
      companyName: contact.companyName.trim(),
      email: contact.email.trim(),
    }))
    .filter((contact) => getContactDisplayName(contact) || contact.email || contact.companyName)
    .filter((contact) => {
      const key = [
        contact.firstName.toLocaleLowerCase(),
        contact.lastName.toLocaleLowerCase(),
        contact.companyName.toLocaleLowerCase(),
        contact.email.toLocaleLowerCase(),
      ].join("|");

      if (seenContacts.has(key)) {
        return false;
      }

      seenContacts.add(key);

      return true;
    });
}

export function getContactDisplayName(contact: Pick<InteractionContact, "firstName" | "lastName">) {
  return [contact.firstName, contact.lastName].filter(Boolean).join(" ").trim();
}

export function sortInteractionsReverseChronological(items: Interaction[]) {
  return [...items].sort((first, second) => {
    const firstTime = new Date(first.date).getTime();
    const secondTime = new Date(second.date).getTime();

    return secondTime - firstTime;
  });
}

export function normalizeStringList(items: string[]) {
  return Array.from(
    new Set(
      items
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function createInteractionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `interaction-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
