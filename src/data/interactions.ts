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
  "Affinity",
  "Airtable",
  "Amazon Selling Partner",
  "Amplemarket",
  "Amplitude",
  "Apollo.io",
  "App Store Connect",
  "Appcues",
  "AppsFlyer",
  "Asana",
  "Ascend",
  "Ashby",
  "Attio",
  "Auth0",
  "Autumn",
  "Autura",
  "AWS Athena",
  "AWS OpenSearch",
  "Azure Blob Storage",
  "Azure Cosmos DB",
  "Azure SQL",
  "Azure Synapse",
  "Barbour ABI",
  "Baseten",
  "Botpress",
  "Brevo",
  "Calendly",
  "CallRail",
  "Campfire",
  "Chameleon",
  "Chargebee",
  "Chili Piper",
  "Chorus",
  "Circle",
  "Clari Copilot",
  "Clazar",
  "Clerk",
  "ClickHouse",
  "Cloudflare Logs",
  "Cloudflare R2",
  "CloudTalk",
  "Construct Connect",
  "ConstructionWire",
  "CSV URL",
  "Customer.io",
  "Customer.io Warehouse Exports",
  "Databricks",
  "Datadog",
  "Dayforce",
  "dbt Cloud",
  "dbt Project Repository",
  "DealCloud",
  "Delighted",
  "Dialpad",
  "Dittofeed",
  "Docker Hub",
  "Dropbox",
  "Dub",
  "DynamoDB",
  "Facebook Ads",
  "Factors.ai",
  "Fathom",
  "Fireflies.ai",
  "Freshdesk",
  "Freshservice",
  "Front",
  "Fullstory",
  "G2",
  "Gainsight CS",
  "Gatsby",
  "GitHub",
  "Gladly",
  "Glean",
  "Gmail",
  "Gong",
  "Google Ads",
  "Google Analytics",
  "Google BigQuery",
  "Google Cloud MySQL",
  "Google Cloud PostgreSQL",
  "Google Cloud Storage",
  "Google Search Console",
  "Google Sheets",
  "Google Slides",
  "Google Workspace",
  "Gorgias",
  "Greenhouse",
  "Harmonic",
  "Heap",
  "Heron Data",
  "HeyReach",
  "HighLevel",
  "Highspot",
  "Honeycomb",
  "HTTP API",
  "HTTP Enrichment",
  "HubSpot",
  "Hyperline",
  "IBM Db2",
  "Instantly",
  "Intellimize",
  "Intercom",
  "Ironclad",
  "Iterable",
  "Jira",
  "Juro",
  "Klaviyo",
  "Knock",
  "Kustomer",
  "Lago",
  "LearnWorlds",
  "Linear",
  "LinkedIn Ads",
  "Lob",
  "Loop",
  "Loops",
  "Luma",
  "m3ter",
  "MailerCheck",
  "Marketo",
  "Microsoft Ads",
  "Microsoft Dynamics 365",
  "Microsoft SharePoint Excel",
  "Microsoft SQL Server",
  "Mixpanel",
  "monday.com",
  "MongoDB",
  "MotherDuck",
  "MySQL",
  "n8n",
  "NetSuite",
  "NetSuite OpenAir",
  "NetSuite SuiteAnalytics",
  "Northbeam",
  "Notion",
  "Outreach",
  "Pardot",
  "PartnerPage",
  "Paycor",
  "Pinterest Ads",
  "Pipedrive",
  "Pitchbook",
  "Plain",
  "PlusVibe",
  "Polytomic Metadata",
  "PostgreSQL",
  "PostHog",
  "PredictLeads",
  "Productboard",
  "Profound",
  "Pylon",
  "QtaniumConnect",
  "Qualtrics",
  "QuickBooks",
  "Ramp",
  "Recharge",
  "Reddit Ads",
  "Redshift",
  "Redshift Serverless",
  "Reo.dev",
  "Reply",
  "Rewardful",
  "Rippling",
  "Rocketlane",
  "S3",
  "Sage Intacct",
  "Salesbricks",
  "Salesforce",
  "Salesloft",
  "Scamalytics",
  "ScyllaDB",
  "Seal Subscriptions",
  "Seam AI",
  "Segment",
  "Seismic",
  "SFTP",
  "Shared Connection",
  "ShipBob",
  "Shippo",
  "Shopify",
  "Short.io",
  "Showpad",
  "Slack",
  "Smartlead.ai",
  "Smartsheet",
  "Snowflake",
  "Sprig",
  "Sprout Social",
  "Standard Metrics",
  "Statsig",
  "Stord",
  "Strackr",
  "Stripe",
  "SurveyMonkey",
  "Survicate",
  "Tabs",
  "TestRail",
  "Thrive",
  "Tigris",
  "TikTok Ads",
  "Tixr",
  "Towbook",
  "Twilio Sendgrid",
  "Typeform",
  "Unbounce",
  "Upfluence",
  "UpPromote",
  "UserVoice",
  "Vanilla Forums",
  "Walmart Marketplace",
  "Ware2Go",
  "Webhook",
  "WorkOS",
  "Xero",
  "Yotpo",
  "YouTube Analytics",
  "Zendesk Chat",
  "Zendesk Support",
  "Zoho CRM",
  "Zoho Desk",
  "ZoomInfo",
] as const;

export type FeatureInterest = (typeof FEATURE_OPTIONS)[number];

export type InteractionContact = {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
};

// Features include the known FEATURE_OPTIONS plus any free-text "Other" values.
export type Feature = FeatureInterest | (string & {});

export type Interaction = {
  id: string;
  companyName: string;
  participants: string[];
  contacts: InteractionContact[];
  date: string;
  meetingSet: boolean;
  features: Feature[];
  platformInterests: string[];
};

export type InteractionDraft = {
  companyName: string;
  participants: string[];
  contacts: InteractionContact[];
  features: Feature[];
  platformInterests: string[];
  calendarEventCreated: boolean;
  scannedRawCodes: string[];
  // When false (manual entry), scanned contacts are not looked up via Apollo.
  enrichmentEnabled: boolean;
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
    enrichmentEnabled: true,
  };
}

// When `base` is provided (editing an existing interaction), its id and date
// are preserved; otherwise a fresh id and the current timestamp are used.
export function createInteractionFromDraft(
  draft: InteractionDraft,
  base?: Pick<Interaction, "id" | "date">,
): Interaction {
  const contacts = normalizeContacts(draft.contacts);

  return {
    id: base?.id ?? createInteractionId(),
    companyName: draft.companyName.trim(),
    participants: normalizeStringList([...draft.participants, ...contacts.map(getContactDisplayName)]),
    contacts,
    date: base?.date ?? new Date().toISOString(),
    meetingSet: draft.calendarEventCreated,
    features: normalizeStringList(draft.features),
    platformInterests: normalizeStringList(draft.platformInterests),
  };
}

export function createDraftFromInteraction(interaction: Interaction): InteractionDraft {
  return {
    companyName: interaction.companyName,
    participants: [...interaction.participants],
    contacts: interaction.contacts.map((contact) => ({ ...contact })),
    features: [...interaction.features],
    platformInterests: [...interaction.platformInterests],
    calendarEventCreated: interaction.meetingSet,
    scannedRawCodes: [],
    enrichmentEnabled: true,
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
