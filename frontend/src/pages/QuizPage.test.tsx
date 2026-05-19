import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { QuizPage } from "./QuizPage";
import type { AppSettings, ReviewGrade, Word, WordProgress } from "../types";

const mockUseWords = vi.fn();

vi.mock("../lib/utils", async () => {
  const actual =
    await vi.importActual<typeof import("../lib/utils")>("../lib/utils");

  return {
    ...actual,
    randomItems: <T,>(items: T[], count: number) =>
      [...items].reverse().slice(0, count),
  };
});

vi.mock("../state/WordsProvider", () => ({
  useWords: () => mockUseWords(),
}));

const deck: Word[] = [
  {
    id: 2,
    word: "abuse",
    definition: "to treat someone cruelly",
    slug: "abuse",
    exampleSentence: "Some people abuse power when nobody stops them.",
  },
  {
    id: 3,
    word: "activity",
    definition: "an action or task",
    slug: "activity",
    exampleSentence: "Reading together is a calm evening activity.",
  },
  {
    id: 4,
    word: "accident",
    definition: "a sudden unplanned event",
    slug: "accident",
    exampleSentence: "The glass broke by accident during cleanup.",
  },
  {
    id: 5,
    word: "benefit",
    definition: "an advantage or helpful effect",
    slug: "benefit",
    exampleSentence: "Daily practice has the benefit of steady progress.",
  },
  {
    id: 1,
    word: "habit",
    definition: "the usual way of behaving",
    slug: "habit",
    exampleSentence: "Checking your notes every night can become a habit.",
  },
];

function createSettings(overrides: Partial<AppSettings> = {}): AppSettings {
  return {
    dailyNewLimit: 12,
    dailyReviewGoal: 20,
    dailyNewGoal: 8,
    quizSize: 2,
    quizMode: "definition-to-word",
    ...overrides,
  };
}

function createProgress(overrides: Partial<WordProgress> = {}): WordProgress {
  return {
    status: "learning",
    bucket: 0,
    nextReviewAt: "2026-05-14T10:00:00.000Z",
    lastReviewedAt: "2026-05-14T09:00:00.000Z",
    reviewCount: 1,
    correctCount: 0,
    failCount: 1,
    lastFailedAt: "2026-05-14T09:00:00.000Z",
    ...overrides,
  };
}

describe("QuizPage", () => {
  beforeEach(() => {
    mockUseWords.mockReset();
  });

  it("keeps advancing after a correct answer and updates score", async () => {
    const user = userEvent.setup();
    const updateWordProgress =
      vi.fn<(wordId: number, grade: ReviewGrade) => void>();
    const recordSession = vi.fn();

    mockUseWords.mockReturnValue({
      deck,
      loading: false,
      error: null,
      studyProgress: {},
      appSettings: createSettings(),
      updateWordProgress,
      updateSettings: vi.fn(),
      recordSession,
    });

    render(<QuizPage />);

    expect(screen.getByText("Question 1 / 2")).toBeInTheDocument();
    expect(screen.getByText("Score 0")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /word habit/i }));
    expect(updateWordProgress).toHaveBeenCalledWith(1, "good");

    await user.click(screen.getByRole("button", { name: "Next question" }));

    expect(screen.getByText("Question 2 / 2")).toBeInTheDocument();
    expect(screen.getByText("Score 1")).toBeInTheDocument();
    expect(recordSession).not.toHaveBeenCalled();
  });

  it("starts with due review words before untouched words", () => {
    mockUseWords.mockReturnValue({
      deck,
      loading: false,
      error: null,
      studyProgress: {
        2: createProgress(),
      },
      appSettings: createSettings({ quizSize: 2 }),
      updateWordProgress: vi.fn(),
      updateSettings: vi.fn(),
      recordSession: vi.fn(),
    });

    render(<QuizPage />);

    expect(screen.getByText("to treat someone cruelly")).toBeInTheDocument();
    expect(screen.queryByText("the usual way of behaving")).not.toBeInTheDocument();
  });

  it("keeps advancing after a wrong answer without increasing score", async () => {
    const user = userEvent.setup();
    const updateWordProgress =
      vi.fn<(wordId: number, grade: ReviewGrade) => void>();

    mockUseWords.mockReturnValue({
      deck,
      loading: false,
      error: null,
      studyProgress: {},
      appSettings: createSettings(),
      updateWordProgress,
      updateSettings: vi.fn(),
      recordSession: vi.fn(),
    });

    render(<QuizPage />);

    await user.click(screen.getByRole("button", { name: /word benefit/i }));
    expect(updateWordProgress).toHaveBeenCalledWith(1, "again");

    await user.click(screen.getByRole("button", { name: "Next question" }));

    expect(screen.getByText("Question 2 / 2")).toBeInTheDocument();
    expect(screen.getByText("Score 0")).toBeInTheDocument();
  });

  it("renders a separate word to definition mode", async () => {
    const user = userEvent.setup();
    const updateWordProgress =
      vi.fn<(wordId: number, grade: ReviewGrade) => void>();

    mockUseWords.mockReturnValue({
      deck,
      loading: false,
      error: null,
      studyProgress: {},
      appSettings: createSettings({ quizMode: "word-to-definition" }),
      updateWordProgress,
      updateSettings: vi.fn(),
      recordSession: vi.fn(),
    });

    render(<QuizPage />);

    expect(
      screen.getByText(
        "Word to definition recall. Read the term, then spot the right meaning.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Word")).toBeInTheDocument();
    expect(screen.getByText("habit")).toBeInTheDocument();
    expect(screen.getByText("the usual way of behaving")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /the usual way of behaving/i }),
    );

    expect(updateWordProgress).toHaveBeenCalledWith(1, "good");
  });

  it("does not always start quizzes from the alphabetically first new words", () => {
    const shuffledDeck: Word[] = [
      {
        id: 1,
        word: "abuse",
        definition: "to treat someone cruelly",
        slug: "abuse",
        exampleSentence: "Some people abuse power when nobody stops them.",
      },
      {
        id: 2,
        word: "accident",
        definition: "a sudden unplanned event",
        slug: "accident",
        exampleSentence: "The glass broke by accident during cleanup.",
      },
      {
        id: 3,
        word: "activity",
        definition: "an action or task",
        slug: "activity",
        exampleSentence: "Reading together is a calm evening activity.",
      },
      {
        id: 4,
        word: "benefit",
        definition: "an advantage or helpful effect",
        slug: "benefit",
        exampleSentence: "Daily practice has the benefit of steady progress.",
      },
      {
        id: 5,
        word: "culture",
        definition: "the ideas and customs of a society",
        slug: "culture",
        exampleSentence: "Music is a visible part of local culture.",
      },
    ];

    mockUseWords.mockReturnValue({
      deck: shuffledDeck,
      loading: false,
      error: null,
      studyProgress: {},
      appSettings: createSettings({ quizSize: 3 }),
      updateWordProgress: vi.fn(),
      updateSettings: vi.fn(),
      recordSession: vi.fn(),
    });

    render(<QuizPage />);

    expect(screen.getByText("culture")).toBeInTheDocument();
    expect(screen.queryByText("abuse")).not.toBeInTheDocument();
  });
});
