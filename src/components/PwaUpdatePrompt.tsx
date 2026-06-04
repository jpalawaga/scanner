import { RefreshCw, X } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_scriptUrl, registration) {
      if (!registration) {
        return;
      }

      const checkForUpdate = () => {
        if (document.visibilityState === "visible") {
          void registration.update();
        }
      };

      document.addEventListener("visibilitychange", checkForUpdate);
    },
  });

  if (!needRefresh) {
    return null;
  }

  return (
    <aside className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-950">Update available</p>
          <p className="mt-0.5 text-xs leading-5 text-slate-500">
            Reload Scanner to use the latest version.
          </p>
        </div>
        <button
          className="flex min-h-10 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white"
          onClick={() => void updateServiceWorker(true)}
          type="button"
        >
          <RefreshCw aria-hidden="true" className="h-4 w-4" strokeWidth={2.25} />
          Update
        </button>
        <button
          aria-label="Dismiss update"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500"
          onClick={() => setNeedRefresh(false)}
          type="button"
        >
          <X aria-hidden="true" className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </div>
    </aside>
  );
}
