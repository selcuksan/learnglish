export type Word = {
  id: number;
  word: string;
  definition: string;
  slug: string;
  exampleSentence: string;
};

export type Meta = {
  version: string;
  generatedAt: string;
  totalWords: number;
};

export type ReviewStatus = "new" | "learning" | "review";
export type ReviewGrade = "again" | "hard" | "good" | "easy";
export type QuizMode = "definition-to-word" | "word-to-definition";

export type WordProgress = {
  status: ReviewStatus;
  bucket: number;
  nextReviewAt: string | null;
  lastReviewedAt: string | null;
  reviewCount: number;
  correctCount: number;
  failCount: number;
  lastFailedAt: string | null;
};

export type StudyProgress = Record<number, WordProgress>;

export type AppSettings = {
  dailyNewLimit: number;
  dailyReviewGoal: number;
  dailyNewGoal: number;
  quizSize: number;
  quizMode: QuizMode;
};

export type SessionHistoryItem = {
  id: string;
  kind: "study" | "quiz" | "mistakes";
  completedAt: string;
  total: number;
  correct: number;
  reviewed: number;
  newLearned: number;
};

export type PersistedState = {
  version: number;
  studyProgress: StudyProgress;
  appSettings: AppSettings;
  sessionHistory: SessionHistoryItem[];
};

export type WordsResponse = {
  items: Word[];
  total: number;
  limit: number;
  offset: number;
};
