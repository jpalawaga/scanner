import {
  ArrowLeft,
  CalendarPlus,
  Camera,
  Check,
  Plus,
  Trash2,
  UserPlus,
} from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { createGoogleCalendarUrl, downloadCalendarEvent } from "../calendar";
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
  const allPlatformOptions = useMemo(
    () =>
      normalizeStringList([
        ...DEFAULT_PLATFORM_OPTIONS,
        ...availablePlatformOptions,
        ...draft.platformInterests,
      ]).map((option) => option.toLocaleLowerCase()),
    [availablePlatformOptions, draft.platformInterests],
  );

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
    setPlatformQuery("");
  }

  function addPlatformFromQuery() {
    const platform = platformQuery.trim().toLocaleLowerCase();

    if (!platform) {
      return;
    }

    onAddPlatformOption(platform);
    updateDraft({
      platformInterests: normalizeStringList([...draft.platformInterests, platform]),
    });
    setPlatformQuery("");
  }

  function handleCalendarDownload() {
    downloadCalendarEvent(draft);
    updateDraft({ calendarEventCreated: true });
    setCalendarStatus("Calendar file created");
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
        <header className="flex items-center">
          <button
            aria-label="Back"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft aria-hidden="true" className="h-5 w-5" strokeWidth={2.25} />
          </button>
        </header>

        <div className="mt-6">
          <p className="text-sm font-medium text-slate-500">New interaction</p>
          <input
            aria-label="Company name"
            className="mt-1 w-full border-b border-dashed border-slate-300 bg-transparent pb-1 text-2xl font-semibold tracking-tight text-slate-950 caret-slate-900 outline-none placeholder:font-normal placeholder:text-slate-300 focus:border-solid focus:border-slate-500"
            onChange={(event) => updateDraft({ companyName: event.target.value })}
            placeholder="Company name"
            value={draft.companyName}
          />
        </div>

        <section className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-700">Participants</h2>
            <div className="flex items-center gap-2">
              <button
                className="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm"
                onClick={addManualContact}
                type="button"
              >
                <UserPlus aria-hidden="true" className="h-4 w-4" strokeWidth={2.25} />
                Add
              </button>
              <button
                className="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm"
                onClick={onScanParticipant}
                type="button"
              >
                <Camera aria-hidden="true" className="h-4 w-4" strokeWidth={2.25} />
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
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
                    key={contact.id}
                  >
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1 space-y-1">
                        <input
                          aria-label={`Name for ${participantLabel}`}
                          className="w-full rounded-md bg-transparent px-1 py-0.5 text-base font-semibold text-slate-950 outline-none placeholder:font-normal placeholder:text-slate-300 focus:bg-slate-50"
                          onChange={(event) =>
                            updateContact(index, { firstName: event.target.value, lastName: "" })
                          }
                          placeholder="Name"
                          value={nameValue}
                        />
                        <input
                          aria-label={`Company for ${participantLabel}`}
                          className="w-full rounded-md bg-transparent px-1 py-0.5 text-sm font-medium text-slate-500 outline-none placeholder:text-slate-300 focus:bg-slate-50"
                          onChange={(event) => updateContact(index, { companyName: event.target.value })}
                          placeholder="Company"
                          value={contact.companyName}
                        />
                        <input
                          aria-label={`Email for ${participantLabel}`}
                          className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                          inputMode="email"
                          onChange={(event) => updateContact(index, { email: event.target.value })}
                          placeholder="email"
                          type="email"
                          value={contact.email}
                        />
                      </div>
                      <button
                        aria-label={`Remove ${participantLabel}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm"
                        onClick={() => removeContact(index)}
                        type="button"
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" strokeWidth={2.25} />
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
                No participants yet — scan a badge or add one manually.
              </div>
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

        <section className="mt-6">
          <h2 className="text-sm font-semibold text-slate-700">Platform interest</h2>
          <div className="mt-2 flex gap-2">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Search platform interest</span>
              <input
                className="min-h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-950 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                onChange={(event) => setPlatformQuery(event.target.value)}
                placeholder="Search platforms"
                type="search"
                value={platformQuery}
              />
            </label>
            <button
              aria-label="Add platform option"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm disabled:text-slate-300"
              disabled={!platformQuery.trim()}
              onClick={addPlatformFromQuery}
              type="button"
            >
              <Plus aria-hidden="true" className="h-5 w-5" strokeWidth={2.25} />
            </button>
          </div>

          <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            {allPlatformOptions
              .filter((platform) => platform.includes(platformQuery.trim().toLocaleLowerCase()))
              .map((platform) => {
                const isSelected = draft.platformInterests.includes(platform);

                return (
                  <label
                    className="flex min-h-12 cursor-pointer items-center justify-between gap-3 border-b border-slate-100 px-3 last:border-b-0"
                    key={platform}
                  >
                    <span className="text-sm font-medium text-slate-800">{platform}</span>
                    <input
                      checked={isSelected}
                      className="h-5 w-5 accent-emerald-600"
                      onChange={() => togglePlatform(platform)}
                      type="checkbox"
                    />
                  </label>
                );
              })}
          </div>
        </section>

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
          <button
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-base font-semibold text-slate-700 shadow-sm disabled:text-slate-300"
            disabled={!canSave}
            onClick={handleCalendarDownload}
            type="button"
          >
            <CalendarPlus aria-hidden="true" className="h-5 w-5" strokeWidth={2.25} />
            Download .ics
          </button>
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
