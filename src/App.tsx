import { useMemo, useState } from "react";
import {
  createDraftFromInteraction,
  createEmptyInteractionDraft,
  createInteractionContact,
  createInteractionFromDraft,
  getContactDisplayName,
  normalizeStringList,
  normalizeContacts,
  sortInteractionsReverseChronological,
  type Interaction,
  type InteractionDraft,
} from "./data/interactions";
import { enrichContact } from "./data/enrichment";
import { parseQrContact } from "./data/qr";
import {
  loadCustomPlatformOptions,
  loadInteractions,
  storeCustomPlatformOptions,
  storeInteractions,
} from "./data/storage";
import { AddInteractionScreen } from "./screens/AddInteractionScreen";
import { PwaUpdatePrompt } from "./components/PwaUpdatePrompt";
import { HomeScreen } from "./screens/HomeScreen";
import { ScanScreen } from "./screens/ScanScreen";

type AppView =
  | { name: "home" }
  | { name: "scan"; mode: "new" | "participant"; returnDraft: InteractionDraft; editingId?: string }
  | { name: "add"; draft: InteractionDraft; editingId?: string };

export default function App() {
  const [interactions, setInteractions] = useState<Interaction[]>(() => loadInteractions());
  const [customPlatformOptions, setCustomPlatformOptions] = useState<string[]>(() =>
    loadCustomPlatformOptions(),
  );
  const [view, setView] = useState<AppView>({ name: "home" });
  const availablePlatformOptions = useMemo(
    () => normalizeStringList(customPlatformOptions),
    [customPlatformOptions],
  );

  function startNewInteractionScan() {
    setView({
      name: "scan",
      mode: "new",
      returnDraft: createEmptyInteractionDraft(),
    });
  }

  function startManualInteraction() {
    // No scan, no Apollo lookups for anything entered or scanned in this draft.
    setView({
      name: "add",
      draft: { ...createEmptyInteractionDraft(), enrichmentEnabled: false },
    });
  }

  function startEditInteraction(interaction: Interaction) {
    setView({
      name: "add",
      draft: createDraftFromInteraction(interaction),
      editingId: interaction.id,
    });
  }

  function handleScan(rawText: string) {
    if (view.name !== "scan") {
      return;
    }

    const scannedContact = parseQrContact(rawText);
    const draft = mergeScannedContact(view.returnDraft, scannedContact, rawText);

    setView({ name: "add", draft, editingId: view.editingId });
    void enrichDraftContacts(draft);
  }

  // Best-effort: look up verified emails for freshly scanned contacts that
  // don't already have one, and patch them into the draft as results arrive.
  async function enrichDraftContacts(draft: InteractionDraft) {
    if (!draft.enrichmentEnabled) {
      return;
    }

    const targets = draft.contacts.filter(
      (contact) => !contact.email && getContactDisplayName(contact),
    );

    await Promise.all(
      targets.map(async (contact) => {
        const result = await enrichContact({
          firstName: contact.firstName,
          lastName: contact.lastName,
          companyName: contact.companyName || draft.companyName,
        });

        if (result) {
          setView((current) => applyEnrichedEmail(current, contact.id, result.email));
        }
      }),
    );
  }

  function handleScanParticipant(draft: InteractionDraft, editingId?: string) {
    setView({
      name: "scan",
      mode: "participant",
      returnDraft: draft,
      editingId,
    });
  }

  function handleSave(draft: InteractionDraft) {
    const editingId = view.name === "add" ? view.editingId : undefined;
    const existing = editingId
      ? interactions.find((interaction) => interaction.id === editingId)
      : undefined;
    const savedInteraction = createInteractionFromDraft(
      draft,
      existing ? { id: existing.id, date: existing.date } : undefined,
    );
    const nextInteractions = sortInteractionsReverseChronological(
      existing
        ? interactions.map((interaction) =>
            interaction.id === existing.id ? savedInteraction : interaction,
          )
        : [savedInteraction, ...interactions],
    );

    setInteractions(nextInteractions);
    storeInteractions(nextInteractions);
    setView({ name: "home" });
  }

  function handleAddPlatformOption(option: string) {
    const normalizedOption = option.trim();

    if (!normalizedOption) {
      return;
    }

    const nextOptions = normalizeStringList([...customPlatformOptions, normalizedOption]);

    setCustomPlatformOptions(nextOptions);
    storeCustomPlatformOptions(nextOptions);
  }

  if (view.name === "scan") {
    return (
      <>
        <ScanScreen
          heading={view.mode === "new" ? "Scan QR code" : "Scan participant"}
          onBack={() =>
            setView(
              view.mode === "new"
                ? { name: "home" }
                : { name: "add", draft: view.returnDraft, editingId: view.editingId },
            )
          }
          onScan={handleScan}
        />
        <PwaUpdatePrompt />
      </>
    );
  }

  if (view.name === "add") {
    return (
      <>
        <AddInteractionScreen
          availablePlatformOptions={availablePlatformOptions}
          draft={view.draft}
          onAddPlatformOption={handleAddPlatformOption}
          onBack={() => setView({ name: "home" })}
          onChange={(draft) => setView({ name: "add", draft, editingId: view.editingId })}
          onSave={handleSave}
          onScanParticipant={() => handleScanParticipant(view.draft, view.editingId)}
        />
        <PwaUpdatePrompt />
      </>
    );
  }

  return (
    <>
      <HomeScreen
        interactions={interactions}
        onEditInteraction={startEditInteraction}
        onManualInteraction={startManualInteraction}
        onNewInteraction={startNewInteractionScan}
      />
      <PwaUpdatePrompt />
    </>
  );
}

function applyEnrichedEmail(view: AppView, contactId: string, email: string): AppView {
  if (view.name !== "add") {
    return view;
  }

  return {
    ...view,
    draft: {
      ...view.draft,
      contacts: view.draft.contacts.map((contact) =>
        contact.id === contactId && !contact.email ? { ...contact, email } : contact,
      ),
    },
  };
}

function mergeScannedContact(
  draft: InteractionDraft,
  contact: ReturnType<typeof parseQrContact>,
  rawText: string,
): InteractionDraft {
  return {
    ...draft,
    companyName: draft.companyName || contact.companyName,
    participants: normalizeStringList([...draft.participants, ...contact.participants]),
    contacts: normalizeContacts([
      ...draft.contacts,
      ...contact.contacts.map((scannedContact) =>
        createInteractionContact({
          firstName: scannedContact.firstName,
          lastName: scannedContact.lastName,
          companyName: scannedContact.companyName || contact.companyName || draft.companyName,
          email: scannedContact.email,
        }),
      ),
    ]),
    scannedRawCodes: [...draft.scannedRawCodes, rawText],
  };
}
