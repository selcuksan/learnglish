import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { fetchDeck, fetchMeta } from "../lib/api";
import {
  loadState,
  resetState,
  sanitizePersistedState,
  saveState,
} from "../lib/storage";
import { applyReview, getDefaultProgress } from "../lib/spacedRepetition";
import type {
  AppSettings,
  Meta,
  PersistedState,
  ReviewGrade,
  SessionHistoryItem,
  StudyProgress,
  Word,
  WordProgress,
} from "../types";

type WordsContextValue = {
  deck: Word[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  studyProgress: StudyProgress;
  appSettings: AppSettings;
  sessionHistory: SessionHistoryItem[];
  stateSnapshot: PersistedState;
  updateWordProgress: (wordId: number, grade: ReviewGrade) => WordProgress;
  updateSettings: (next: Partial<AppSettings>) => void;
  recordSession: (
    session: Omit<SessionHistoryItem, "id" | "completedAt">,
  ) => void;
  importProgress: (value: unknown) => void;
  resetProgress: () => void;
};

const WordsContext = createContext<WordsContextValue | null>(null);

export function WordsProvider({ children }: PropsWithChildren) {
  const [deck, setDeck] = useState<Word[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<PersistedState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [nextDeck, nextMeta] = await Promise.all([
          fetchDeck(),
          fetchMeta(),
        ]);
        if (cancelled) {
          return;
        }

        startTransition(() => {
          setDeck(nextDeck);
          setMeta(nextMeta);
          setLoading(false);
        });
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load data.",
        );
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<WordsContextValue>(
    () => ({
      deck,
      meta,
      loading,
      error,
      studyProgress: state.studyProgress,
      appSettings: state.appSettings,
      sessionHistory: state.sessionHistory,
      stateSnapshot: state,
      updateWordProgress(wordId, grade) {
        const nextProgress = applyReview(
          state.studyProgress[wordId] ?? getDefaultProgress(),
          grade,
        );
        setState((current) => ({
          ...current,
          studyProgress: {
            ...current.studyProgress,
            [wordId]: nextProgress,
          },
        }));
        return nextProgress;
      },
      updateSettings(next) {
        setState((current) => ({
          ...current,
          appSettings: {
            ...current.appSettings,
            ...next,
          },
        }));
      },
      recordSession(session) {
        setState((current) => ({
          ...current,
          sessionHistory: [
            {
              ...session,
              id: crypto.randomUUID(),
              completedAt: new Date().toISOString(),
            },
            ...current.sessionHistory,
          ].slice(0, 30),
        }));
      },
      importProgress(value) {
        setState(sanitizePersistedState(value));
      },
      resetProgress() {
        setState(resetState());
      },
    }),
    [deck, error, loading, meta, state],
  );

  return (
    <WordsContext.Provider value={value}>{children}</WordsContext.Provider>
  );
}

export function useWords() {
  const context = useContext(WordsContext);
  if (!context) {
    throw new Error("useWords must be used inside WordsProvider");
  }
  return context;
}
