export type ScannedContact = {
  companyName: string;
  participants: string[];
  rawText: string;
};

const companyKeys = [
  "company",
  "companyname",
  "organization",
  "organisation",
  "org",
  "account",
  "employer",
];
const fullNameKeys = ["name", "fullname", "full_name", "fn", "participant", "attendee", "attendeename"];
const firstNameKeys = ["first", "firstname", "first_name", "given", "givenname"];
const lastNameKeys = ["last", "lastname", "last_name", "family", "familyname", "surname"];

export function parseQrContact(rawText: string): ScannedContact {
  const normalizedRawText = rawText.trim();
  const jsonContact = parseJsonContact(normalizedRawText);
  const vCardContact = parseVCardContact(normalizedRawText);
  const urlContact = parseUrlContact(normalizedRawText);
  const caretBadgeContact = parseCaretBadgeContact(normalizedRawText);
  const plainTextContact = parsePlainTextContact(normalizedRawText);
  const merged = [jsonContact, vCardContact, urlContact, caretBadgeContact, plainTextContact].reduce<ScannedContact>(
    (current, contact) => ({
      companyName: current.companyName || contact.companyName,
      participants: uniqueStrings([...current.participants, ...contact.participants]),
      rawText: normalizedRawText,
    }),
    { companyName: "", participants: [], rawText: normalizedRawText },
  );

  return merged;
}

function parseCaretBadgeContact(rawText: string): ScannedContact {
  const parts = rawText.split("^").map(normalizeWhitespace);

  if (parts.length < 4 || !rawText.includes("^")) {
    return emptyContact(rawText);
  }

  const firstName = parts[1] ?? "";
  const lastName = parts[2] ?? "";
  const companyName = parts[3] ?? "";
  const fullName = combineName(firstName, lastName);

  if (!fullName && !companyName) {
    return emptyContact(rawText);
  }

  return {
    companyName,
    participants: fullName ? [fullName] : [],
    rawText,
  };
}

function parseJsonContact(rawText: string): ScannedContact {
  try {
    const parsedValue = JSON.parse(rawText);

    if (!parsedValue || typeof parsedValue !== "object") {
      return emptyContact(rawText);
    }

    const source = parsedValue as Record<string, unknown>;
    const fullName = readString(source, fullNameKeys) || combineName(readString(source, firstNameKeys), readString(source, lastNameKeys));
    const participants = readParticipants(source);

    return {
      companyName: readString(source, companyKeys),
      participants: uniqueStrings(fullName ? [fullName, ...participants] : participants),
      rawText,
    };
  } catch {
    return emptyContact(rawText);
  }
}

function parseVCardContact(rawText: string): ScannedContact {
  if (!rawText.toLocaleUpperCase().includes("BEGIN:VCARD")) {
    return emptyContact(rawText);
  }

  const fields = new Map<string, string[]>();

  for (const line of unfoldLines(rawText)) {
    const separatorIndex = line.indexOf(":");

    if (separatorIndex < 0) {
      continue;
    }

    const fieldName = line.slice(0, separatorIndex).split(";")[0].toLocaleUpperCase();
    const fieldValue = decodeVCardValue(line.slice(separatorIndex + 1));
    const existingValues = fields.get(fieldName) ?? [];

    fields.set(fieldName, [...existingValues, fieldValue]);
  }

  const fullName = firstField(fields, "FN") || parseStructuredVCardName(firstField(fields, "N"));
  const organization = firstField(fields, "ORG")?.split(";")[0] ?? "";

  return {
    companyName: normalizeWhitespace(organization),
    participants: fullName ? [normalizeWhitespace(fullName)] : [],
    rawText,
  };
}

function parseUrlContact(rawText: string): ScannedContact {
  try {
    const url = new URL(rawText);
    const params = url.searchParams;
    const fullName =
      readParam(params, fullNameKeys) ||
      combineName(readParam(params, firstNameKeys), readParam(params, lastNameKeys));

    return {
      companyName: readParam(params, companyKeys),
      participants: fullName ? [fullName] : [],
      rawText,
    };
  } catch {
    return emptyContact(rawText);
  }
}

function parsePlainTextContact(rawText: string): ScannedContact {
  const lines = rawText
    .split(/\r?\n|[|]/)
    .map(normalizeWhitespace)
    .filter(Boolean);

  if (lines.length === 0) {
    return emptyContact(rawText);
  }

  const pairs = new Map<string, string>();

  for (const line of lines) {
    const match = line.match(/^([^:=]+)\s*[:=]\s*(.+)$/);

    if (match) {
      pairs.set(normalizeKey(match[1]), normalizeWhitespace(match[2]));
    }
  }

  const companyName = readString(Object.fromEntries(pairs), companyKeys);
  const fullName =
    readString(Object.fromEntries(pairs), fullNameKeys) ||
    combineName(readString(Object.fromEntries(pairs), firstNameKeys), readString(Object.fromEntries(pairs), lastNameKeys));

  if (companyName || fullName) {
    return {
      companyName,
      participants: fullName ? [fullName] : [],
      rawText,
    };
  }

  if (lines.length === 1 && !looksLikeUrl(lines[0]) && !lines[0].includes("^")) {
    return {
      companyName: "",
      participants: [lines[0]],
      rawText,
    };
  }

  return emptyContact(rawText);
}

function readParticipants(source: Record<string, unknown>) {
  const participantsValue = readUnknown(source, ["participants", "people", "attendees", "contacts"]);

  if (!Array.isArray(participantsValue)) {
    return [];
  }

  return participantsValue
    .map((participant) => {
      if (typeof participant === "string") {
        return participant;
      }

      if (!participant || typeof participant !== "object") {
        return "";
      }

      const participantRecord = participant as Record<string, unknown>;

      return (
        readString(participantRecord, fullNameKeys) ||
        combineName(readString(participantRecord, firstNameKeys), readString(participantRecord, lastNameKeys))
      );
    })
    .map(normalizeWhitespace)
    .filter(Boolean);
}

function readString(source: Record<string, unknown>, keys: string[]) {
  const value = readUnknown(source, keys);

  return typeof value === "string" ? normalizeWhitespace(value) : "";
}

function readUnknown(source: Record<string, unknown>, keys: string[]) {
  const normalizedKeys = new Set(keys.map(normalizeKey));

  for (const [key, value] of Object.entries(source)) {
    if (normalizedKeys.has(normalizeKey(key))) {
      return value;
    }
  }

  return undefined;
}

function readParam(params: URLSearchParams, keys: string[]) {
  for (const [key, value] of params.entries()) {
    if (keys.map(normalizeKey).includes(normalizeKey(key)) && value.trim()) {
      return normalizeWhitespace(value);
    }
  }

  return "";
}

function firstField(fields: Map<string, string[]>, key: string) {
  return fields.get(key)?.find(Boolean) ?? "";
}

function unfoldLines(rawText: string) {
  return rawText.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "").split(/\r?\n/);
}

function parseStructuredVCardName(value = "") {
  const [lastName, firstName, middleName, prefix, suffix] = value.split(";");

  return normalizeWhitespace([prefix, firstName, middleName, lastName, suffix].filter(Boolean).join(" "));
}

function decodeVCardValue(value: string) {
  return value
    .replace(/\\n/gi, " ")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function combineName(firstName = "", lastName = "") {
  return normalizeWhitespace([firstName, lastName].filter(Boolean).join(" "));
}

function uniqueStrings(items: string[]) {
  return Array.from(new Set(items.map(normalizeWhitespace).filter(Boolean)));
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeKey(value: string) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
}

function looksLikeUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function emptyContact(rawText: string): ScannedContact {
  return {
    companyName: "",
    participants: [],
    rawText,
  };
}
