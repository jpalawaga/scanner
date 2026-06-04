import { CalendarDays, Pencil, QrCode, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { interactions as defaultInteractions, type Interaction } from "../data/interactions";

type HomeScreenProps = {
  interactions?: Interaction[];
  onNewInteraction?: () => void;
  onManualInteraction?: () => void;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function formatInteractionDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return dateFormatter.format(parsed);
}

function participantSummary(participants: string[]) {
  if (participants.length === 0) {
    return "No participants listed";
  }

  return participants.join(", ");
}

export function HomeScreen({
  interactions = defaultInteractions,
  onNewInteraction,
  onManualInteraction,
}: HomeScreenProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();

  const filteredInteractions = useMemo(() => {
    if (!normalizedQuery) {
      return interactions;
    }

    return interactions.filter((interaction) => {
      const companyMatch = interaction.companyName.toLocaleLowerCase().includes(normalizedQuery);
      const participantMatch = interaction.participants.some((participant) =>
        participant.toLocaleLowerCase().includes(normalizedQuery),
      );

      return companyMatch || participantMatch;
    });
  }, [interactions, normalizedQuery]);

  const isSearchingEmptyList = normalizedQuery.length > 0 && interactions.length > 0;

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-5 sm:px-6">
        <header className="mb-5">
          <p className="text-sm font-medium text-slate-500">Scanner</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">
            Interactions
          </h1>
        </header>

        <div className="space-y-2">
          <button
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-base font-semibold text-white shadow-sm disabled:bg-slate-300"
            disabled={!onNewInteraction}
            onClick={onNewInteraction}
            type="button"
          >
            <QrCode aria-hidden="true" className="h-5 w-5" strokeWidth={2.25} />
            Record new interaction
          </button>
          <button
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-base font-semibold text-slate-700 shadow-sm disabled:text-slate-300"
            disabled={!onManualInteraction}
            onClick={onManualInteraction}
            type="button"
          >
            <Pencil aria-hidden="true" className="h-5 w-5" strokeWidth={2.25} />
            Enter manually
          </button>
        </div>

        <label className="mt-4 block">
          <span className="sr-only">Search interactions</span>
          <span className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 shadow-sm focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200">
            <Search aria-hidden="true" className="h-5 w-5 text-slate-400" strokeWidth={2.25} />
            <input
              className="min-w-0 flex-1 bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-400"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search company or participant"
              type="search"
              value={query}
            />
          </span>
        </label>

        <section aria-label="Interaction list" className="mt-4 flex-1">
          {filteredInteractions.length > 0 ? (
            <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              {filteredInteractions.map((interaction) => (
                <li key={interaction.id}>
                  <article className="flex min-h-20 w-full items-center gap-4 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-base font-semibold text-slate-950">
                        {interaction.companyName}
                      </h2>
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {participantSummary(interaction.participants)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-sm font-medium text-slate-500">
                      {interaction.meetingSet ? (
                        <span aria-label="Meeting scheduled" title="Meeting scheduled">
                          <CalendarDays aria-hidden="true" className="h-5 w-5 text-emerald-600" />
                        </span>
                      ) : null}
                      <time dateTime={interaction.date}>{formatInteractionDate(interaction.date)}</time>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  {isSearchingEmptyList ? "No matches found" : "No interactions yet"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {isSearchingEmptyList
                    ? "Try searching by company name or participant."
                    : "Recorded conversations will appear here after you scan and save an interaction."}
                </p>
              </div>
            </div>
          )}
        </section>

        <footer className="mt-6 pb-2 text-center text-xs text-slate-400">
          <span>{__APP_BUILD_VERSION__}</span>
          <span aria-hidden="true"> · </span>
          <span>{__APP_BUILD_STAMP__}</span>
        </footer>
      </div>
    </main>
  );
}
