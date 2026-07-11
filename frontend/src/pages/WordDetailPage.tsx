import { useEffect, useState } from "react";

import { ExampleSentence } from "../components/ExampleSentence";
import { PronounceButton } from "../components/PronounceButton";
import { SectionHeader } from "../components/SectionHeader";
import { getMemoryStage } from "../lib/spacedRepetition";
import { formatDate } from "../lib/utils";
import { useWords } from "../state/WordsProvider";
import type { Word } from "../types";
import { useParams, Link } from "react-router-dom";

export function WordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { deck, loading, error, studyProgress } = useWords();
  const [word, setWord] = useState<Word | null>(null);

  useEffect(() => {
    if (!id || deck.length === 0) {
      return;
    }

    const wordId = parseInt(id, 10);
    const found = deck.find((w) => w.id === wordId);
    setWord(found ?? null);
  }, [id, deck]);

  if (loading) {
    return <div className="p-6 text-slate-700">Loading word details...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-700">Could not load data: {error}</div>
    );
  }

  if (!word) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Word not found"
          detail="This word does not exist in the dataset."
        />
        <Link
          to="/browse"
          className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          Back to browse
        </Link>
      </div>
    );
  }

  const progress = studyProgress[word.id];
  const stage = progress ? getMemoryStage(progress.bucket) : null;

  return (
    <div className="space-y-6">
      <SectionHeader title="Word detail" detail={`ID #${word.id}`} />

      <section className="glass-panel rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(29,44,76,0.12)]">
        <div className="rounded-[1.75rem] bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 p-8 text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">
            Word
          </p>
          <div className="mt-4 flex items-center gap-3">
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {word.word}
            </h2>
            <PronounceButton
              word={word.word}
              className="text-cyan-200 hover:text-white"
              size={22}
            />
          </div>
          <div className="mt-8 rounded-[1.4rem] bg-white/10 p-5 text-sm leading-7 text-white/86">
            {word.definition}
          </div>
          <ExampleSentence
            sentence={word.exampleSentence}
            className="mt-4 text-white/90"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="glass-panel rounded-[1.75rem] border border-white/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Learning status
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <span className="text-sm font-semibold capitalize text-slate-950">
                {progress?.status ?? "new"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">
                Memory stage
              </span>
              <span className="text-sm font-semibold text-slate-950">
                {stage?.label ?? "Not started"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">
                Next review
              </span>
              <span className="text-sm text-slate-700">
                {progress
                  ? formatDate(progress.nextReviewAt)
                  : "Not reviewed yet"}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[1.75rem] border border-white/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Review history
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">
                Total reviews
              </span>
              <span className="text-sm font-semibold text-slate-950">
                {progress?.reviewCount ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">
                Correct
              </span>
              <span className="text-sm font-semibold text-emerald-700">
                {progress?.correctCount ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">Fails</span>
              <span className="text-sm font-semibold text-rose-600">
                {progress?.failCount ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">
                Last reviewed
              </span>
              <span className="text-sm text-slate-700">
                {progress
                  ? formatDate(progress.lastReviewedAt)
                  : "Never"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <Link
        to="/browse"
        className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
      >
        ← Back to browse
      </Link>
    </div>
  );
}
