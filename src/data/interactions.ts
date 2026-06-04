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

export type Interaction = {
  id: string;
  companyName: string;
  participants: string[];
  date: string;
  meetingSet: boolean;
  features: FeatureInterest[];
  platformInterests: string[];
};

export type InteractionDraft = {
  companyName: string;
  participants: string[];
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
    features: [],
    platformInterests: [],
    calendarEventCreated: false,
    scannedRawCodes: [],
  };
}

export function createInteractionFromDraft(draft: InteractionDraft): Interaction {
  return {
    id: createInteractionId(),
    companyName: draft.companyName.trim(),
    participants: normalizeStringList(draft.participants),
    date: new Date().toISOString(),
    meetingSet: draft.calendarEventCreated,
    features: draft.features,
    platformInterests: normalizeStringList(draft.platformInterests),
  };
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
