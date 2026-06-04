import {
  ArrowLeft,
  CalendarPlus,
  Camera,
  Check,
  Plus,
  Trash2,
} from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { downloadCalendarEvent } from "../calendar";
import {
  DEFAULT_PLATFORM_OPTIONS,
  FEATURE_OPTIONS,
  normalizeStringList,
  type FeatureInterest,
  type InteractionDraft,
} from "../data/interactions";

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

  function updateParticipant(index: number, value: string) {
    updateDraft({
      participants: draft.participants.map((participant, participantIndex) =>
        participantIndex === index ? value : participant,
      ),
    });
  }

  function removeParticipant(index: number) {
    updateDraft({
      participants: draft.participants.filter((_, participantIndex) => participantIndex !== index),
    });
  }

  function toggleFeature(feature: FeatureInterest) {
    updateDraft({
      features: draft.features.includes(feature)
        ? draft.features.filter((selectedFeature) => selectedFeature !== feature)
        : [...draft.features, feature],
    });
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (canSave) {
      onSave({
        ...draft,
        companyName: normalizedCompanyName,
        participants: normalizeStringList(draft.participants),
        platformInterests: normalizeStringList(draft.platformInterests),
      });
    }
  }

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-950">
      <form className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-5 sm:px-6" onSubmit={handleSubmit}>
        <header className="grid grid-cols-[44px_1fr_44px] items-center">
          <button
            aria-label="Back"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft aria-hidden="true" className="h-5 w-5" strokeWidth={2.25} />
          </button>
          <h1 className="text-center text-lg font-semibold text-slate-950">New Interaction</h1>
        </header>

        <label className="mt-6 block">
          <span className="text-sm font-semibold text-slate-700">Company name</span>
          <input
            className="mt-2 min-h-14 w-full rounded-lg border border-slate-200 bg-white px-4 text-xl font-semibold text-slate-950 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            onChange={(event) => updateDraft({ companyName: event.target.value })}
            placeholder="Company"
            value={draft.companyName}
          />
        </label>

        <section className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-700">Participants</h2>
            <button
              className="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm"
              onClick={onScanParticipant}
              type="button"
            >
              <Camera aria-hidden="true" className="h-4 w-4" strokeWidth={2.25} />
              Scan
            </button>
          </div>

          <div className="mt-2 space-y-2">
            {draft.participants.length > 0 ? (
              draft.participants.map((participant, index) => (
                <div className="flex items-center gap-2" key={`${participant}-${index}`}>
                  <label className="sr-only" htmlFor={`participant-${index}`}>
                    Participant {index + 1}
                  </label>
                  <input
                    className="min-h-12 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-950 shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    id={`participant-${index}`}
                    onChange={(event) => updateParticipant(index, event.target.value)}
                    value={participant}
                  />
                  <button
                    aria-label={`Remove ${participant || `participant ${index + 1}`}`}
                    className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm"
                    onClick={() => removeParticipant(index)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" strokeWidth={2.25} />
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
                No participants scanned.
              </div>
            )}
          </div>
        </section>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-slate-700">Features of interest</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {FEATURE_OPTIONS.map((feature) => {
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
          </div>
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
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-base font-semibold text-slate-700 shadow-sm disabled:text-slate-300"
            disabled={!canSave}
            onClick={handleCalendarDownload}
            type="button"
          >
            <CalendarPlus aria-hidden="true" className="h-5 w-5" strokeWidth={2.25} />
            Add to calendar
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
