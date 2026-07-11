import { useDeferredValue, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ExampleSentence } from "../components/ExampleSentence";
import { PronounceButton } from "../components/PronounceButton";
import { SectionHeader } from "../components/SectionHeader";
import { fetchWords } from "../lib/api";
import { formatDate } from "../lib/utils";
import { useWords } from "../state/WordsProvider";
import type { Word, WordsResponse } from "../types";

const PAGE_SIZE = 24;

export function BrowsePage() {
  const { studyProgress } = useWords();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<WordsResponse>({
    items: [],
    total: 0,
    limit: PAGE_SIZE,
    offset: 0,
  });
  const [loading, setLoading] = useState(true);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void fetchWords(deferredSearch, PAGE_SIZE, page * PAGE_SIZE).then(
      (result) => {
        if (cancelled) {
          return;
        }
        setData(result);
        setLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [deferredSearch, page]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Browse deck"
        detail="Search the embedded NGSL dataset and inspect your state per word."
      />
      <section className="glass-panel rounded-[2rem] border border-white/70 p-5">
        <div className="flex flex-col gap-4 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            placeholder="Search by word or definition"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-500"
          />
          <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white">
            {data.total} results
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/60">
          <div className="grid grid-cols-[1.1fr_2fr_0.9fr] bg-slate-950 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
            <span>Word</span>
            <span>Definition</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-slate-200/70 bg-white/70">
            {loading ? (
              <div className="px-4 py-6 text-sm text-slate-600">
                Searching deck...
              </div>
            ) : (
              data.items.map((word) => (
                <BrowseRow
                  key={word.id}
                  word={word}
                  progress={studyProgress[word.id]}
                />
              ))
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(0, value - 1))}
            disabled={page === 0}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 disabled:opacity-40"
          >
            Previous
          </button>
          <p className="text-sm text-slate-600">
            Page {page + 1} of {Math.max(1, Math.ceil(data.total / PAGE_SIZE))}
          </p>
          <button
            type="button"
            onClick={() => setPage((value) => value + 1)}
            disabled={(page + 1) * PAGE_SIZE >= data.total}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}

function BrowseRow({
  word,
  progress,
}: {
  word: Word;
  progress?: { status: string; nextReviewAt: string | null };
}) {
  return (
    <div className="grid grid-cols-[1.1fr_2fr_0.9fr] gap-4 px-4 py-4 text-sm">
      <div>
        <div className="flex items-center gap-1">
          <Link to={`/words/${word.id}`} className="font-semibold text-slate-950 hover:text-cyan-700 transition">
            {word.word}
          </Link>
          <PronounceButton
            word={word.word}
            className="text-slate-400 hover:text-slate-700"
            size={14}
          />
        </div>
        <p className="mt-1 text-xs text-slate-500">{word.slug}</p>
      </div>
      <div>
        <p className="leading-6 text-slate-700">{word.definition}</p>
        <ExampleSentence
          sentence={word.exampleSentence}
          className="mt-3 border-slate-200/70 bg-slate-50/80 text-slate-700"
        />
      </div>
      <div className="text-slate-600">
        <p className="font-medium capitalize text-slate-900">
          {progress?.status ?? "new"}
        </p>
        <p className="mt-1 text-xs">
          {progress ? formatDate(progress.nextReviewAt) : "Untouched"}
        </p>
      </div>
    </div>
  );
}
