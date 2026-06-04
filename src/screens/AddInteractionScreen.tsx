import {
  CalendarPlus,
  Camera,
  Check,
  ChevronLeft,
  Mail,
  Plus,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import type { FormEvent } from "react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { createGoogleCalendarUrl, createMailtoUrl } from "../calendar";
import {
  createInteractionContact,
  DEFAULT_PLATFORM_OPTIONS,
  FEATURE_OPTIONS,
  getContactDisplayName,
  normalizeContacts,
  normalizeStringList,
  type Feature,
  type InteractionContact,
  type InteractionDraft,
} from "../data/interactions";

const KNOWN_FEATURES = new Set<string>(FEATURE_OPTIONS);

type AddInteractionScreenProps = {
  availablePlatformOptions: string[];
  draft: InteractionDraft;
  onBack: () => void;
  onChange: (draft: InteractionDraft) => void;
  onSave: (draft: InteractionDraft) => void;
  onScanParticipant: () => void;
  onAddPlatformOption: (option: string) => void;
};

export function AddInteractionScreen({
  availablePlatformOptions,
  draft,
  onBack,
  onChange,
  onSave,
  onScanParticipant,
  onAddPlatformOption,
}: AddInteractionScreenProps) {
  const [platformQuery, setPlatformQuery] = useState("");
  const [calendarStatus, setCalendarStatus] = useState("");
  const [featureQuery, setFeatureQuery] = useState("");
  const [isAddingFeature, setIsAddingFeature] = useState(false);
  const customFeatures = draft.features.filter((feature) => !KNOWN_FEATURES.has(feature));
  const normalizedCompanyName = draft.companyName.trim();
  const canSave = normalizedCompanyName.length > 0;
  const companyNameRef = useRef<HTMLTextAreaElement>(null);

  // The company name is a hero heading that wraps for long names, so grow the
  // textarea to fit its content instead of scrolling.
  useLayoutEffect(() => {
    const element = companyNameRef.current;

    if (element) {
      element.style.height = "auto";
      element.style.height = `${element.scrollHeight}px`;
    }
  }, [draft.companyName]);
  const allPlatformOptions = useMemo(
    () =>
      normalizeStringList([
        ...DEFAULT_PLATFORM_OPTIONS,
        ...availablePlatformOptions,
        ...draft.platformInterests,
      ]),
    [availablePlatformOptions, draft.platformInterests],
  );
  const normalizedPlatformQuery = platformQuery.trim().toLocaleLowerCase();
  const matchingPlatformOptions = normalizedPlatformQuery
    ? allPlatformOptions
        .filter((option) => !draft.platformInterests.includes(option))
        .filter((option) => option.toLocaleLowerCase().includes(normalizedPlatformQuery))
        .slice(0, 8)
    : [];
  const canAddCustomPlatform =
    normalizedPlatformQuery.length > 0 &&
    !allPlatformOptions.some((option) => option.toLocaleLowerCase() === normalizedPlatformQuery);

  function updateDraft(updates: Partial<InteractionDraft>) {
    onChange({
      ...draft,
      ...updates,
    });
  }

  function updateContact(index: number, updates: Partial<InteractionContact>) {
    updateDraft({
      contacts: draft.contacts.map((contact, contactIndex) =>
        contactIndex === index ? { ...contact, ...updates } : contact,
      ),
    });
  }

  function addManualContact() {
    updateDraft({
      contacts: [...draft.contacts, createInteractionContact({ companyName: draft.companyName })],
    });
  }

  function removeContact(index: number) {
    updateDraft({
      contacts: draft.contacts.filter((_, contactIndex) => contactIndex !== index),
    });
  }

  function toggleFeature(feature: Feature) {
    updateDraft({
      features: draft.features.includes(feature)
        ? draft.features.filter((selectedFeature) => selectedFeature !== feature)
        : [...draft.features, feature],
    });
  }

  function addCustomFeature() {
    const feature = featureQuery.trim();

    if (feature && !draft.features.includes(feature)) {
      updateDraft({ features: [...draft.features, feature] });
    }

    setFeatureQuery("");
    setIsAddingFeature(false);
  }

  function togglePlatform(platform: string) {
    updateDraft({
      platformInterests: draft.platformInterests.includes(platform)
        ? draft.platformInterests.filter((selectedPlatform) => selectedPlatform !== platform)
        : [...draft.platformInterests, platform],
    });
  }

  function selectPlatform(platform: string) {
    if (!draft.platformInterests.includes(platform)) {
      updateDraft({ platformInterests: [...draft.platformInterests, platform] });
    }

    setPlatformQuery("");
  }

  function addPlatformFromQuery() {
    const platform = platformQuery.trim();

    if (platform) {
      onAddPlatformOption(platform);
      updateDraft({
        platformInterests: normalizeStringList([...draft.platformInterests, platform]),
      });
    }

    setPlatformQuery("");
  }

  function handleGoogleCalendarOpen() {
    window.open(createGoogleCalendarUrl(draft), "_blank", "noopener,noreferrer");
    updateDraft({ calendarEventCreated: true });
    setCalendarStatus("Google Calendar opened");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (canSave) {
      const contacts = normalizeContacts(draft.contacts);

      onSave({
        ...draft,
        companyName: normalizedCompanyName,
        participants: normalizeStringList([...draft.participants, ...contacts.map(getContactDisplayName)]),
        contacts,
        platformInterests: normalizeStringList(draft.platformInterests),
      });
    }
  }

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-950">
      <form className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-5 sm:px-6" onSubmit={handleSubmit}>
        <header className="-ml-1 flex items-center gap-2">
          <button
            aria-label="Back"
            className="flex h-8 w-8 items-center justify-center text-slate-400 hover:text-slate-700"
            onClick={onBack}
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="h-6 w-6" strokeWidth={2.25} />
          </button>
          <span className="text-sm font-medium text-slate-500">New interaction</span>
        </header>

        <div className="mt-4">
          <textarea
            aria-label="Company name"
            className="w-full resize-none bg-transparent text-3xl font-bold leading-tight tracking-tight text-slate-950 caret-slate-900 outline-none placeholder:font-semibold placeholder:text-slate-300"
            onChange={(event) => updateDraft({ companyName: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              }
            }}
            placeholder="Company name"
            ref={companyNameRef}
            rows={1}
            value={draft.companyName}
          />
        </div>

        <section className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-700">Participants</h2>
            <div className="flex items-center gap-1.5">
              <button
                className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-sm font-medium text-slate-600 hover:text-slate-900"
                onClick={addManualContact}
                type="button"
              >
                <UserPlus aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
                Add
              </button>
              <button
                className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-sm font-medium text-slate-600 hover:text-slate-900"
                onClick={onScanParticipant}
                type="button"
              >
                <Camera aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
                Scan
              </button>
            </div>
          </div>

          <div className="mt-2 space-y-2">
            {draft.contacts.length > 0 ? (
              draft.contacts.map((contact, index) => {
                const nameValue = contact.lastName
                  ? `${contact.firstName} ${contact.lastName}`
                  : contact.firstName;
                const participantLabel = getContactDisplayName(contact) || `participant ${index + 1}`;

                return (
                  <article
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                    key={contact.id}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <input
                          aria-label={`Name for ${participantLabel}`}
                          className="-mx-1 w-[calc(100%+0.5rem)] rounded-md px-1 py-0.5 text-base font-semibold text-slate-950 outline-none placeholder:font-normal placeholder:text-slate-300 focus:bg-slate-50"
                          onChange={(event) =>
                            updateContact(index, { firstName: event.target.value, lastName: "" })
                          }
                          placeholder="Name"
                          value={nameValue}
                        />
                        <input
                          aria-label={`Company for ${participantLabel}`}
                          className="-mx-1 mt-0.5 w-[calc(100%+0.5rem)] rounded-md px-1 py-0.5 text-sm font-medium text-slate-500 outline-none placeholder:text-slate-300 focus:bg-slate-50"
                          onChange={(event) => updateContact(index, { companyName: event.target.value })}
                          placeholder="Company"
                          value={contact.companyName}
                        />
                      </div>
                      <button
                        aria-label={`Remove ${participantLabel}`}
                        className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-300 hover:bg-slate-50 hover:text-slate-500"
                        onClick={() => removeContact(index)}
                        type="button"
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center gap-2 border-t border-slate-100 pt-2">
                      <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
                      <input
                        aria-label={`Email for ${participantLabel}`}
                        className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300"
                        inputMode="email"
                        onChange={(event) => updateContact(index, { email: event.target.value })}
                        placeholder="Add email"
                        type="email"
                        value={contact.email}
                      />
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="px-1 py-2 text-sm text-slate-400">No participants yet.</p>
            )}
          </div>
        </section>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-slate-700">Features of interest</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[...FEATURE_OPTIONS, ...customFeatures].map((feature) => {
              const isSelected = draft.features.includes(feature);

              return (
                <label
                  className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-3 text-sm font-semibold ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                  key={feature}
                >
                  <input
                    checked={isSelected}
                    className="sr-only"
                    onChange={() => toggleFeature(feature)}
                    type="checkbox"
                  />
                  {isSelected ? <Check aria-hidden="true" className="h-4 w-4" strokeWidth={2.25} /> : null}
                  {feature}
                </label>
              );
            })}

            <button
              aria-expanded={isAddingFeature}
              className="flex min-h-10 items-center gap-2 rounded-full border border-dashed border-slate-300 bg-white px-3 text-sm font-semibold text-slate-600"
              onClick={() => setIsAddingFeature((value) => !value)}
              type="button"
            >
              <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2.25} />
              Other
            </button>
          </div>

          {isAddingFeature ? (
            <div className="mt-2 flex gap-2">
              <label className="min-w-0 flex-1">
                <span className="sr-only">Other feature</span>
                <input
                  autoFocus
                  className="min-h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-950 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  onChange={(event) => setFeatureQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addCustomFeature();
                    }
                  }}
                  placeholder="Add a feature"
                  value={featureQuery}
                />
              </label>
              <button
                aria-label="Add feature"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm disabled:text-slate-300"
                disabled={!featureQuery.trim()}
                onClick={addCustomFeature}
                type="button"
              >
                <Plus aria-hidden="true" className="h-5 w-5" strokeWidth={2.25} />
              </button>
            </div>
          ) : null}
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-slate-700">Integration interest</legend>

          {draft.platformInterests.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {draft.platformInterests.map((platform) => (
                <button
                  aria-label={`Remove ${platform}`}
                  className="flex min-h-9 items-center gap-1.5 rounded-full border border-emerald-600 bg-emerald-50 px-3 text-sm font-semibold text-emerald-800"
                  key={platform}
                  onClick={() => togglePlatform(platform)}
                  type="button"
                >
                  {platform}
                  <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-2">
            <label className="block">
              <span className="sr-only">Search integrations</span>
              <input
                className="min-h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-950 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                onChange={(event) => setPlatformQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") {
                    return;
                  }

                  event.preventDefault();

                  if (matchingPlatformOptions.length > 0) {
                    selectPlatform(matchingPlatformOptions[0]);
                  } else if (canAddCustomPlatform) {
                    addPlatformFromQuery();
                  }
                }}
                placeholder="Search integrations"
                type="search"
                value={platformQuery}
              />
            </label>

            {normalizedPlatformQuery ? (
              <div className="mt-1 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                {matchingPlatformOptions.map((option) => (
                  <button
                    className="flex min-h-11 w-full items-center px-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
                    key={option}
                    onClick={() => selectPlatform(option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
                {canAddCustomPlatform ? (
                  <button
                    className="flex min-h-11 w-full items-center gap-2 border-t border-slate-100 px-3 text-left text-sm font-medium text-emerald-700 hover:bg-slate-50"
                    onClick={addPlatformFromQuery}
                    type="button"
                  >
                    <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2.25} />
                    {`Add "${platformQuery.trim()}"`}
                  </button>
                ) : null}
                {matchingPlatformOptions.length === 0 && !canAddCustomPlatform ? (
                  <p className="px-3 py-2 text-sm text-slate-400">Already added.</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </fieldset>

        <div className="mt-6 space-y-3">
          <button
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-950 bg-slate-950 px-4 text-base font-semibold text-white shadow-sm disabled:border-slate-300 disabled:bg-slate-300"
            disabled={!canSave}
            onClick={handleGoogleCalendarOpen}
            type="button"
          >
            <CalendarPlus aria-hidden="true" className="h-5 w-5" strokeWidth={2.25} />
            Google Calendar
          </button>
          <a
            aria-disabled={!canSave}
            className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-base font-semibold shadow-sm ${
              canSave ? "text-slate-700" : "pointer-events-none text-slate-300"
            }`}
            href={canSave ? createMailtoUrl(draft) : undefined}
            onClick={() => setCalendarStatus("Email draft opened")}
          >
            <Mail aria-hidden="true" className="h-5 w-5" strokeWidth={2.25} />
            Email
          </a>
          {calendarStatus ? (
            <p aria-live="polite" className="text-center text-sm font-medium text-emerald-700">
              {calendarStatus}
            </p>
          ) : null}
        </div>

        <div className="mt-auto pt-6">
          <button
            className="min-h-14 w-full rounded-lg bg-slate-950 px-4 text-base font-semibold text-white shadow-sm disabled:bg-slate-300"
            disabled={!canSave}
            type="submit"
          >
            Done
          </button>
        </div>
      </form>
    </main>
  );
}
