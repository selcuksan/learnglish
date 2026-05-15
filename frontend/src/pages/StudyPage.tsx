import { useMemo, useState } from "react";

import { SectionHeader } from "../components/SectionHeader";
import { getDueWords, getNewWords } from "../lib/spacedRepetition";
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

function buildStudyQueue(
  dailyNewLimit: number,
  dueWords: Word[],
  newWords: Word[],
) {
  const dueIDs = new Set(dueWords.map((word) => word.id));
  return [
    ...dueWords,
    ...newWords.filter((word) => !dueIDs.has(word.id)).slice(0, dailyNewLimit),
  ].slice(0, 30);
}

export function StudyPage() {
  const {
    deck,
    loading,
    error,
    studyProgress,
    appSettings,
    updateWordProgress,
    recordSession,
  } = useWords();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const dueWords = useMemo(
    () => getDueWords(deck, studyProgress),
    [deck, studyProgress],
  );
  const newWords = useMemo(
    () => getNewWords(deck, studyProgress),
    [deck, studyProgress],
  );
  const queue = useMemo(
    () => buildStudyQueue(appSettings.dailyNewLimit, dueWords, newWords),
    [appSettings.dailyNewLimit, dueWords, newWords],
  );
  const dueWordIDs = useMemo(
    () => new Set(dueWords.map((word) => word.id)),
    [dueWords],
  );
  const newWordIDs = useMemo(
    () => new Set(newWords.map((word) => word.id)),
    [newWords],
  );

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
      const reviewed = queue.length;
      const newLearned = queue.filter((word) => newWordIDs.has(word.id)).length;
      recordSession({
        kind: "study",
        total: reviewed,
        correct: nextCorrectCount,
        reviewed,
        newLearned,
      });
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-slate-700">Preparing your study queue...</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-700">Could not load the deck: {error}</div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Study session"
        detail={`${dueWords.length} due reviews, up to ${appSettings.dailyNewLimit} fresh words in this pass.`}
      />

      {queue.length === 0 ? (
        <div className="glass-panel rounded-[2rem] border border-white/70 p-8 text-sm text-slate-700">
          You are fully caught up. Come back later or open the browse tab to
          inspect the full deck.
        </div>
      ) : completed ? (
        <div className="glass-panel rounded-[2rem] border border-white/70 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">
            Session complete
          </p>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            Nice clean finish.
          </h3>
          <p className="mt-3 text-sm text-slate-600">
            You graded {queue.length} cards and marked {correctCount} as
            successful recalls.
          </p>
        </div>
      ) : (
        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-panel rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(29,44,76,0.12)]">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>
                Card {index + 1} / {queue.length}
              </span>
              <span>
                {current && dueWordIDs.has(current.id)
                  ? "Due review"
                  : "New card"}
              </span>
            </div>
            <div className="mt-6 rounded-[1.75rem] bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 p-8 text-white">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">
                Word
              </p>
              <h3 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                {current?.word}
              </h3>
              <div className="mt-10 rounded-[1.4rem] bg-white/10 p-5 text-sm leading-7 text-white/86">
                {revealed
                  ? current?.definition
                  : "Reveal the definition when you are ready to judge recall quality."}
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
          </div>

          <div className="glass-panel rounded-[2rem] border border-white/70 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Grade recall
            </p>
            <div className="mt-5 grid gap-3">
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
            <div className="mt-6 rounded-[1.5rem] bg-white/70 p-4 text-sm leading-7 text-slate-600">
              Use <strong>Again</strong> for failed recall,{" "}
              <strong>Hard</strong> for weak recall, <strong>Good</strong> for
              expected success, and <strong>Easy</strong> when the card feels
              stable already.
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
