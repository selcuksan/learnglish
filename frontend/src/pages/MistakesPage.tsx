import { useMemo, useState } from "react";

import { SectionHeader } from "../components/SectionHeader";
import { getMistakeWords } from "../lib/spacedRepetition";
import { formatDate } from "../lib/utils";
import { useWords } from "../state/WordsProvider";
import type { ReviewGrade, Word } from "../types";

const reviewButtons: Array<{
  grade: ReviewGrade;
  label: string;
  className: string;
}> = [
  { grade: "again", label: "Again", className: "bg-rose-500 text-white" },
  { grade: "hard", label: "Hard", className: "bg-amber-400 text-slate-950" },
  { grade: "good", label: "Good", className: "bg-cyan-500 text-white" },
  { grade: "easy", label: "Easy", className: "bg-emerald-500 text-white" },
];

function buildMistakeQueue(words: Word[]) {
  return words.slice(0, 20);
}

export function MistakesPage() {
  const {
    deck,
    loading,
    error,
    studyProgress,
    updateWordProgress,
    recordSession,
  } = useWords();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const mistakeWords = useMemo(
    () => getMistakeWords(deck, studyProgress),
    [deck, studyProgress],
  );
  const queue = useMemo(() => buildMistakeQueue(mistakeWords), [mistakeWords]);
  const current = queue[index];
  const completed = index >= queue.length && queue.length > 0;

  function handleReview(grade: ReviewGrade) {
    if (!current) {
      return;
    }

    updateWordProgress(current.id, grade);
    const nextCorrectCount =
      grade !== "again" ? correctCount + 1 : correctCount;
    if (grade !== "again") {
      setCorrectCount(nextCorrectCount);
    }

    const nextIndex = index + 1;
    setRevealed(false);
    setIndex(nextIndex);

    if (nextIndex >= queue.length) {
      recordSession({
        kind: "mistakes",
        total: queue.length,
        correct: nextCorrectCount,
        reviewed: queue.length,
        newLearned: 0,
      });
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-slate-700">Loading your mistake notebook...</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-700">
        Could not load the notebook: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Mistake notebook"
        detail="Target the words that have already caused friction in study or quiz mode."
      />

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-panel rounded-[1.75rem] border border-white/70 p-5">
          <SectionHeader
            title="Tracked words"
            detail="Sorted by fail count first, then by the most recent failure."
          />
          <div className="space-y-3">
            {mistakeWords.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-600">
                Your notebook is empty. Any wrong answer in study or quiz mode
                will be captured here automatically.
              </div>
            ) : (
              mistakeWords.slice(0, 10).map((word) => {
                const progress = studyProgress[word.id];
                return (
                  <div
                    key={word.id}
                    className="rounded-2xl bg-white/70 px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {word.word}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(progress?.lastFailedAt ?? null)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-600">
                          {progress?.failCount} fail
                          {progress?.failCount === 1 ? "" : "s"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Bucket {progress?.bucket ?? 0}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {word.definition}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-4">
          {queue.length === 0 ? null : completed ? (
            <div className="glass-panel rounded-[2rem] border border-white/70 p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">
                Notebook pass complete
              </p>
              <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                You revisited the sharp edges.
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                Reviewed {queue.length} mistake cards and recovered{" "}
                {correctCount} of them in this pass.
              </p>
            </div>
          ) : (
            <section className="glass-panel rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(29,44,76,0.12)]">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>
                  Card {index + 1} / {queue.length}
                </span>
                <span>
                  {studyProgress[current.id]?.failCount ?? 0} recorded fail
                  {(studyProgress[current.id]?.failCount ?? 0) === 1 ? "" : "s"}
                </span>
              </div>
              <div className="mt-6 rounded-[1.75rem] bg-linear-to-br from-rose-950 via-slate-900 to-amber-950 p-8 text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-rose-200">
                  Word
                </p>
                <h3 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                  {current.word}
                </h3>
                <div className="mt-10 rounded-[1.4rem] bg-white/10 p-5 text-sm leading-7 text-white/86">
                  {revealed
                    ? current.definition
                    : "Reveal the definition, then re-grade the card with more intention."}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setRevealed((value) => !value)}
                  className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
                >
                  {revealed ? "Hide answer" : "Reveal answer"}
                </button>
              </div>

              <div className="mt-6 grid gap-3">
                {reviewButtons.map((button) => (
                  <button
                    key={button.grade}
                    type="button"
                    onClick={() => handleReview(button.grade)}
                    className={`${button.className} rounded-2xl px-4 py-4 text-left text-sm font-semibold shadow-lg shadow-slate-900/5 transition hover:translate-y-[-1px]`}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
