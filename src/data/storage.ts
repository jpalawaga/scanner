import {
  DEFAULT_PLATFORM_OPTIONS,
  FEATURE_OPTIONS,
  normalizeStringList,
  sortInteractionsReverseChronological,
  type FeatureInterest,
  type Interaction,
} from "./interactions";

const INTERACTIONS_STORAGE_KEY = "scanner.interactions.v1";
const CUSTOM_PLATFORM_OPTIONS_STORAGE_KEY = "scanner.customPlatformOptions.v1";
const featureSet = new Set<string>(FEATURE_OPTIONS);
const defaultPlatformSet = new Set<string>(DEFAULT_PLATFORM_OPTIONS);

export function loadInteractions() {
  if (!isStorageAvailable()) {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(INTERACTIONS_STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return sortInteractionsReverseChronological(parsedValue.map(readInteraction).filter(isInteraction));
  } catch {
    return [];
  }
}

export function storeInteractions(interactions: Interaction[]) {
  if (!isStorageAvailable()) {
    return;
  }

  window.localStorage.setItem(
    INTERACTIONS_STORAGE_KEY,
    JSON.stringify(sortInteractionsReverseChronological(interactions)),
  );
}

export function loadCustomPlatformOptions() {
  if (!isStorageAvailable()) {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(CUSTOM_PLATFORM_OPTIONS_STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return normalizeStringList(parsedValue.filter((item) => typeof item === "string"))
      .map((item) => item.toLocaleLowerCase())
      .filter((item) => !defaultPlatformSet.has(item));
  } catch {
    return [];
  }
}

export function storeCustomPlatformOptions(options: string[]) {
  if (!isStorageAvailable()) {
    return;
  }

  window.localStorage.setItem(
    CUSTOM_PLATFORM_OPTIONS_STORAGE_KEY,
    JSON.stringify(
      normalizeStringList(options)
        .map((item) => item.toLocaleLowerCase())
        .filter((item) => !defaultPlatformSet.has(item)),
    ),
  );
}

function readInteraction(value: unknown): Interaction | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<Interaction>;

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.companyName !== "string" ||
    typeof candidate.date !== "string"
  ) {
    return null;
  }

  return {
    id: candidate.id,
    companyName: candidate.companyName,
    participants: Array.isArray(candidate.participants)
      ? normalizeStringList(candidate.participants.filter((item) => typeof item === "string"))
      : [],
    date: candidate.date,
    meetingSet: Boolean(candidate.meetingSet),
    features: Array.isArray(candidate.features)
      ? candidate.features.filter((feature): feature is FeatureInterest => featureSet.has(feature))
      : [],
    platformInterests: Array.isArray(candidate.platformInterests)
      ? normalizeStringList(candidate.platformInterests.filter((item) => typeof item === "string"))
      : [],
  };
}

function isInteraction(value: Interaction | null): value is Interaction {
  return value !== null;
}

function isStorageAvailable() {
  return typeof window !== "undefined" && "localStorage" in window;
}
