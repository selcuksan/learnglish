import { useEffect, useState } from "react";

import { SectionHeader } from "../components/SectionHeader";
import { buildQuizSource, createQuiz, type QuizCard } from "../lib/quiz";
import { useWords } from "../state/WordsProvider";
import type { QuizMode } from "../types";

const modeCopy: Record<
  QuizMode,
  {
    detail: string;
    promptLabel: string;
    optionLabel: string;
  }
> = {
  "definition-to-word": {
    detail: "Definition to word recognition. One clean decision at a time.",
    promptLabel: "Definition",
    optionLabel: "Word",
  },
  "word-to-definition": {
    detail:
      "Word to definition recall. Read the term, then spot the right meaning.",
    promptLabel: "Word",
    optionLabel: "Definition",
  },
};

export function QuizPage() {
  const {
    deck,
    loading,
    error,
    studyProgress,
    appSettings,
    updateWordProgress,
    updateSettings,
    recordSession,
  } = useWords();
  const [quiz, setQuiz] = useState<QuizCard[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [sessionSeed, setSessionSeed] = useState(0);

  useEffect(() => {
    if (deck.length === 0) {
      return;
    }

    const source = buildQuizSource(deck, studyProgress);
    setQuiz(
      createQuiz(source.length ? source : deck, deck, appSettings.quizSize),
    );
    setIndex(0);
    setScore(0);
    setSelected(null);
  }, [appSettings.quizMode, appSettings.quizSize, deck, sessionSeed]);

  const current = quiz[index];
  const complete = index >= quiz.length && quiz.length > 0;

  function handlePick(optionId: number) {
    if (!current || selected !== null) {
      return;
    }

    const isCorrect = current.prompt.id === optionId;
    setSelected(optionId);
    if (isCorrect) {
      setScore((value) => value + 1);
      updateWordProgress(current.prompt.id, "good");
    } else {
      updateWordProgress(current.prompt.id, "again");
    }
  }

  function handleNext() {
    if (!current || selected === null) {
      return;
    }

    const nextIndex = index + 1;
    setSelected(null);
    setIndex(nextIndex);
    if (nextIndex >= quiz.length) {
      recordSession({
        kind: "quiz",
        total: quiz.length,
        correct: score,
        reviewed: quiz.length,
        newLearned: 0,
      });
    }
  }

  if (loading) {
    return <div className="p-6 text-slate-700">Generating your quiz...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-700">Could not load quiz data: {error}</div>
    );
  }

  const copy = modeCopy[appSettings.quizMode];

  return (
    <div className="space-y-6">
      <SectionHeader title="Quiz mode" detail={copy.detail} />
      <section className="glass-panel rounded-[1.75rem] border border-white/70 p-4">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => updateSettings({ quizMode: "definition-to-word" })}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              appSettings.quizMode === "definition-to-word"
                ? "bg-slate-950 text-white"
                : "border border-slate-300 bg-white text-slate-800"
            }`}
          >
            Definition → Word
          </button>
          <button
            type="button"
            onClick={() => updateSettings({ quizMode: "word-to-definition" })}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              appSettings.quizMode === "word-to-definition"
                ? "bg-slate-950 text-white"
                : "border border-slate-300 bg-white text-slate-800"
            }`}
          >
            Word → Definition
          </button>
        </div>
      </section>
      {quiz.length === 0 ? (
        <div className="glass-panel rounded-[2rem] border border-white/70 p-8 text-sm text-slate-700">
          There is not enough data to generate a quiz yet.
        </div>
      ) : complete ? (
        <div className="glass-panel rounded-[2rem] border border-white/70 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-700">
            Quiz complete
          </p>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            Score: {score} / {quiz.length}
          </h3>
          <p className="mt-3 text-sm text-slate-600">
            Quiz answers also feed your spaced repetition progress.
          </p>
          <button
            type="button"
            onClick={() => setSessionSeed((value) => value + 1)}
            className="mt-5 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Start another quiz
          </button>
        </div>
      ) : (
        <section className="glass-panel rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(29,44,76,0.12)]">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>
              Question {index + 1} / {quiz.length}
            </span>
            <span>Score {score}</span>
          </div>
          <div className="mt-6 rounded-[1.75rem] bg-linear-to-br from-cyan-950 to-slate-950 p-8 text-white">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">
              {copy.promptLabel}
            </p>
            <p className="mt-4 text-xl leading-8 sm:text-2xl">
              {appSettings.quizMode === "definition-to-word"
                ? current?.prompt.definition
                : current?.prompt.word}
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {current?.options.map((option) => {
              const isCorrect = option.id === current.prompt.id;
              const isSelected = selected === option.id;
              const stateClass =
                selected === null
                  ? "border-slate-300 bg-white text-slate-900 hover:border-cyan-400"
                  : isCorrect
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                    : isSelected
                      ? "border-rose-500 bg-rose-50 text-rose-900"
                      : "border-slate-200 bg-slate-50 text-slate-500";

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handlePick(option.id)}
                  className={`rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition ${stateClass}`}
                >
                  <p className="text-xs uppercase tracking-[0.25em] opacity-60">
                    {copy.optionLabel}
                  </p>
                  <p className="mt-2 leading-6">
                    {appSettings.quizMode === "definition-to-word"
                      ? option.word
                      : option.definition}
                  </p>
                </button>
              );
            })}
          </div>
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              disabled={selected === null}
              onClick={handleNext}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next question
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
