import { useMemo, useState } from "react";
import {
  createEmptyInteractionDraft,
  createInteractionFromDraft,
  normalizeStringList,
  sortInteractionsReverseChronological,
  type Interaction,
  type InteractionDraft,
} from "./data/interactions";
import { parseQrContact } from "./data/qr";
import {
  loadCustomPlatformOptions,
  loadInteractions,
  storeCustomPlatformOptions,
  storeInteractions,
} from "./data/storage";
import { AddInteractionScreen } from "./screens/AddInteractionScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { ScanScreen } from "./screens/ScanScreen";

type AppView =
  | { name: "home" }
  | { name: "scan"; mode: "new" | "participant"; returnDraft: InteractionDraft }
  | { name: "add"; draft: InteractionDraft };

export default function App() {
  const [interactions, setInteractions] = useState<Interaction[]>(() => loadInteractions());
  const [customPlatformOptions, setCustomPlatformOptions] = useState<string[]>(() =>
    loadCustomPlatformOptions(),
  );
  const [view, setView] = useState<AppView>({ name: "home" });
  const availablePlatformOptions = useMemo(
    () => normalizeStringList(customPlatformOptions).map((option) => option.toLocaleLowerCase()),
    [customPlatformOptions],
  );

  function startNewInteractionScan() {
    setView({
      name: "scan",
      mode: "new",
      returnDraft: createEmptyInteractionDraft(),
    });
  }

  function handleScan(rawText: string) {
    if (view.name !== "scan") {
      return;
    }

    const scannedContact = parseQrContact(rawText);
    const draft = mergeScannedContact(view.returnDraft, scannedContact, rawText);

    setView({ name: "add", draft });
  }

  function handleScanParticipant(draft: InteractionDraft) {
    setView({
      name: "scan",
      mode: "participant",
      returnDraft: draft,
    });
  }

  function handleSave(draft: InteractionDraft) {
    const savedInteraction = createInteractionFromDraft(draft);
    const nextInteractions = sortInteractionsReverseChronological([savedInteraction, ...interactions]);

    setInteractions(nextInteractions);
    storeInteractions(nextInteractions);
    setView({ name: "home" });
  }

  function handleAddPlatformOption(option: string) {
    const normalizedOption = option.trim().toLocaleLowerCase();

    if (!normalizedOption) {
      return;
    }

    const nextOptions = normalizeStringList([...customPlatformOptions, normalizedOption]).map((item) =>
      item.toLocaleLowerCase(),
    );

    setCustomPlatformOptions(nextOptions);
    storeCustomPlatformOptions(nextOptions);
  }

  if (view.name === "scan") {
    return (
      <ScanScreen
        heading={view.mode === "new" ? "Scan QR code" : "Scan participant"}
        onBack={() => setView(view.mode === "new" ? { name: "home" } : { name: "add", draft: view.returnDraft })}
        onScan={handleScan}
      />
    );
  }

  if (view.name === "add") {
    return (
      <AddInteractionScreen
        availablePlatformOptions={availablePlatformOptions}
        draft={view.draft}
        onAddPlatformOption={handleAddPlatformOption}
        onBack={() => setView({ name: "home" })}
        onChange={(draft) => setView({ name: "add", draft })}
        onSave={handleSave}
        onScanParticipant={() => handleScanParticipant(view.draft)}
      />
    );
  }

  return <HomeScreen interactions={interactions} onNewInteraction={startNewInteractionScan} />;
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
    scannedRawCodes: [...draft.scannedRawCodes, rawText],
  };
}
