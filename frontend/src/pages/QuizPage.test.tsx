import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { QuizPage } from "./QuizPage";
import type { AppSettings, ReviewGrade, Word } from "../types";

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
  },
  {
    id: 3,
    word: "activity",
    definition: "an action or task",
    slug: "activity",
  },
  {
    id: 4,
    word: "accident",
    definition: "a sudden unplanned event",
    slug: "accident",
  },
  {
    id: 5,
    word: "benefit",
    definition: "an advantage or helpful effect",
    slug: "benefit",
  },
  {
    id: 1,
    word: "habit",
    definition: "the usual way of behaving",
    slug: "habit",
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
      },
      {
        id: 2,
        word: "accident",
        definition: "a sudden unplanned event",
        slug: "accident",
      },
      {
        id: 3,
        word: "activity",
        definition: "an action or task",
        slug: "activity",
      },
      {
        id: 4,
        word: "benefit",
        definition: "an advantage or helpful effect",
        slug: "benefit",
      },
      {
        id: 5,
        word: "culture",
        definition: "the ideas and customs of a society",
        slug: "culture",
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
