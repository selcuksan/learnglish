import { useRef, useState, type ChangeEvent } from "react";

import { SectionHeader } from "../components/SectionHeader";
import { serializeState } from "../lib/storage";
import { useWords } from "../state/WordsProvider";

export function SettingsPage() {
  const {
    appSettings,
    resetProgress,
    updateSettings,
    meta,
    stateSnapshot,
    importProgress,
  } = useWords();
  const [confirmReset, setConfirmReset] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleExport() {
    const blob = new Blob([serializeState(stateSnapshot)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `learnglish-progress-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      importProgress(JSON.parse(raw));
      setImportMessage("Progress imported successfully.");
      setConfirmReset(false);
    } catch {
      setImportMessage(
        "Import failed. Please choose a valid Learnglish JSON backup.",
      );
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Settings"
        detail="Control session size and local-only persistence."
      />
      <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <div className="glass-panel rounded-[2rem] border border-white/70 p-6">
          <h3 className="text-lg font-semibold text-slate-950">Study tuning</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="rounded-[1.5rem] bg-white/70 p-4">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Daily new limit
              </span>
              <input
                type="number"
                min={1}
                max={40}
                value={appSettings.dailyNewLimit}
                onChange={(event) =>
                  updateSettings({ dailyNewLimit: Number(event.target.value) })
                }
                className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="rounded-[1.5rem] bg-white/70 p-4">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Quiz size
              </span>
              <input
                type="number"
                min={4}
                max={20}
                value={appSettings.quizSize}
                onChange={(event) =>
                  updateSettings({ quizSize: Number(event.target.value) })
                }
                className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="rounded-[1.5rem] bg-white/70 p-4">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Daily review goal
              </span>
              <input
                type="number"
                min={1}
                max={100}
                value={appSettings.dailyReviewGoal}
                onChange={(event) =>
                  updateSettings({
                    dailyReviewGoal: Number(event.target.value),
                  })
                }
                className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="rounded-[1.5rem] bg-white/70 p-4">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Daily new goal
              </span>
              <input
                type="number"
                min={1}
                max={40}
                value={appSettings.dailyNewGoal}
                onChange={(event) =>
                  updateSettings({ dailyNewGoal: Number(event.target.value) })
                }
                className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] border border-white/70 p-6">
          <h3 className="text-lg font-semibold text-slate-950">Local data</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Progress is stored only in your browser. Dataset version:{" "}
            {meta?.version ?? "unknown"}.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Export progress
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800"
            >
              Import progress
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirmReset) {
                  resetProgress();
                  setConfirmReset(false);
                  setImportMessage(null);
                  return;
                }
                setConfirmReset(true);
              }}
              className="rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white"
            >
              {confirmReset
                ? "Click again to reset all progress"
                : "Reset local progress"}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="hidden"
          />
          <div className="mt-5 rounded-[1.5rem] bg-white/70 p-4 text-sm leading-6 text-slate-600">
            Export saves your current study state as a JSON backup. Import
            replaces the current local state with the selected backup file.
          </div>
          {importMessage ? (
            <p className="mt-3 text-sm text-slate-700">{importMessage}</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
