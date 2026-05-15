import { useState } from "react";

import { SectionHeader } from "../components/SectionHeader";
import { useWords } from "../state/WordsProvider";

export function SettingsPage() {
  const { appSettings, resetProgress, updateSettings, meta } = useWords();
  const [confirmReset, setConfirmReset] = useState(false);

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
          <button
            type="button"
            onClick={() => {
              if (confirmReset) {
                resetProgress();
                setConfirmReset(false);
                return;
              }
              setConfirmReset(true);
            }}
            className="mt-5 rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white"
          >
            {confirmReset
              ? "Click again to reset all progress"
              : "Reset local progress"}
          </button>
        </div>
      </section>
    </div>
  );
}
