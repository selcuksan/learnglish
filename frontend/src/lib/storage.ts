import type {
  AppSettings,
  PersistedState,
  SessionHistoryItem,
  StudyProgress,
} from "../types";

const STORAGE_KEY = "learnglish-state";
const STATE_VERSION = 1;

const defaultSettings: AppSettings = {
  dailyNewLimit: 12,
  dailyReviewGoal: 20,
  dailyNewGoal: 8,
  quizSize: 8,
  quizMode: "definition-to-word",
};

export function createBaseState(): PersistedState {
  return {
    version: STATE_VERSION,
    studyProgress: {},
    appSettings: defaultSettings,
    sessionHistory: [],
  };
}

export function loadState(): PersistedState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createBaseState();
    }

    return sanitizePersistedState(JSON.parse(raw));
  } catch {
    return createBaseState();
  }
}

export function saveState(state: PersistedState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  const next = createBaseState();
  saveState(next);
  return next;
}

export function sanitizePersistedState(value: unknown): PersistedState {
  const parsed = value as Partial<PersistedState> | null | undefined;
  return {
    version: STATE_VERSION,
    studyProgress: sanitizeProgress(parsed?.studyProgress),
    appSettings: sanitizeSettings(parsed?.appSettings),
    sessionHistory: sanitizeHistory(parsed?.sessionHistory),
  };
}

export function serializeState(state: PersistedState) {
  return JSON.stringify(state, null, 2);
}

function sanitizeSettings(value: unknown): AppSettings {
  if (!value || typeof value !== "object") {
    return defaultSettings;
  }

  const settings = value as Partial<AppSettings>;
  return {
    dailyNewLimit: clampNumber(
      settings.dailyNewLimit,
      1,
      40,
      defaultSettings.dailyNewLimit,
    ),
    dailyReviewGoal: clampNumber(
      settings.dailyReviewGoal,
      1,
      100,
      defaultSettings.dailyReviewGoal,
    ),
    dailyNewGoal: clampNumber(
      settings.dailyNewGoal,
      1,
      40,
      defaultSettings.dailyNewGoal,
    ),
    quizSize: clampNumber(settings.quizSize, 4, 20, defaultSettings.quizSize),
    quizMode:
      settings.quizMode === "word-to-definition"
        ? "word-to-definition"
        : defaultSettings.quizMode,
  };
}

function sanitizeHistory(value: unknown): SessionHistoryItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const session = item as Partial<SessionHistoryItem>;
      return {
        id: session.id ?? crypto.randomUUID(),
        kind:
          session.kind === "study" ||
          session.kind === "quiz" ||
          session.kind === "mistakes"
            ? session.kind
            : "study",
        completedAt: session.completedAt ?? new Date(0).toISOString(),
        total: typeof session.total === "number" ? session.total : 0,
        correct: typeof session.correct === "number" ? session.correct : 0,
        reviewed:
          typeof session.reviewed === "number"
            ? session.reviewed
            : typeof session.total === "number"
              ? session.total
              : 0,
        newLearned:
          typeof session.newLearned === "number" ? session.newLearned : 0,
      };
    })
    .slice(0, 30);
}

function sanitizeProgress(value: unknown): StudyProgress {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      ([, item]) => item && typeof item === "object",
    ),
  ) as StudyProgress;
}

function clampNumber(
  value: number | undefined,
  min: number,
  max: number,
  fallback: number,
) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(value)));
}
