import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { StudyPage } from "./StudyPage";
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
    id: 1,
    word: "habit",
    definition: "the usual way of behaving",
    slug: "habit",
    exampleSentence: "Checking your notes every night can become a habit.",
  },
  {
    id: 2,
    word: "abuse",
    definition: "to treat someone cruelly",
    slug: "abuse",
    exampleSentence: "Some people abuse power when nobody stops them.",
  },
  {
    id: 3,
    word: "culture",
    definition: "the ideas and customs of a society",
    slug: "culture",
    exampleSentence: "Music is a visible part of local culture.",
  },
];

function createSettings(overrides: Partial<AppSettings> = {}): AppSettings {
  return {
    dailyNewLimit: 2,
    dailyReviewGoal: 20,
    dailyNewGoal: 8,
    quizSize: 8,
    quizMode: "definition-to-word",
    ...overrides,
  };
}

function createProgress(overrides: Partial<WordProgress> = {}): WordProgress {
  return {
    status: "learning",
    bucket: 1,
    nextReviewAt: "2026-05-15T08:00:00.000Z",
    lastReviewedAt: "2026-05-14T08:00:00.000Z",
    reviewCount: 1,
    correctCount: 1,
    failCount: 0,
    lastFailedAt: null,
    ...overrides,
  };
}

describe("StudyPage", () => {
  beforeEach(() => {
    mockUseWords.mockReset();
  });

  it("reveals the definition and example sentence", async () => {
    const user = userEvent.setup();

    mockUseWords.mockReturnValue({
      deck,
      loading: false,
      error: null,
      studyProgress: {},
      appSettings: createSettings(),
      updateWordProgress: vi.fn(),
      recordSession: vi.fn(),
    });

    render(<StudyPage />);

    expect(await screen.findByText("culture")).toBeInTheDocument();
    expect(
      screen.queryByText("the ideas and customs of a society"),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reveal answer" }));

    expect(
      screen.getByText("the ideas and customs of a society"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Music is a visible part of local culture/i),
    ).toBeInTheDocument();
  });

  it("does not always start new study sessions from the alphabetical front", async () => {
    mockUseWords.mockReturnValue({
      deck,
      loading: false,
      error: null,
      studyProgress: {},
      appSettings: createSettings({ dailyNewLimit: 2 }),
      updateWordProgress: vi.fn(),
      recordSession: vi.fn(),
    });

    render(<StudyPage />);

    expect(await screen.findByText("culture")).toBeInTheDocument();
    expect(screen.queryByText("habit")).not.toBeInTheDocument();
  });

  it("previews the effect of each grade before selection", async () => {
    mockUseWords.mockReturnValue({
      deck,
      loading: false,
      error: null,
      studyProgress: {},
      appSettings: createSettings(),
      updateWordProgress: vi.fn(),
      recordSession: vi.fn(),
    });

    render(<StudyPage />);

    expect(
      await screen.findByText("Fresh: review again today"),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("Warming up: review in 1 day"),
    ).toHaveLength(2);
    expect(screen.getByText("Learning: review in 3 days")).toBeInTheDocument();
  });

  it("records review feedback and completes the session", async () => {
    const user = userEvent.setup();
    const updateWordProgress = vi
      .fn<(wordId: number, grade: ReviewGrade) => WordProgress>()
      .mockReturnValue(createProgress({ bucket: 2, status: "review" }));
    const recordSession = vi.fn();

    mockUseWords.mockReturnValue({
      deck: [deck[0]],
      loading: false,
      error: null,
      studyProgress: {},
      appSettings: createSettings({ dailyNewLimit: 1 }),
      updateWordProgress,
      recordSession,
    });

    render(<StudyPage />);

    await user.click(await screen.findByRole("button", { name: "Good" }));

    expect(updateWordProgress).toHaveBeenCalledWith(1, "good");
    expect(screen.getByText("Session complete")).toBeInTheDocument();
    expect(recordSession).toHaveBeenCalledWith({
      kind: "study",
      total: 1,
      correct: 1,
      reviewed: 1,
      newLearned: 1,
    });
  });

  it("shows how the last grade moved the word", async () => {
    const user = userEvent.setup();
    const updateWordProgress = vi
      .fn<(wordId: number, grade: ReviewGrade) => WordProgress>()
      .mockReturnValue(createProgress({ bucket: 4, status: "review" }));

    mockUseWords.mockReturnValue({
      deck,
      loading: false,
      error: null,
      studyProgress: {},
      appSettings: createSettings(),
      updateWordProgress,
      recordSession: vi.fn(),
    });

    render(<StudyPage />);

    await user.click(await screen.findByRole("button", { name: "Easy" }));

    expect(screen.getByText("Last review")).toBeInTheDocument();
    expect(screen.getByText("culture")).toBeInTheDocument();
    expect(screen.getByText("easy")).toBeInTheDocument();
    expect(screen.getByText("Stable")).toBeInTheDocument();
    expect(screen.getByText(/Next rhythm: review in 14 days/i)).toBeInTheDocument();
  });

  it("keeps the session queue stable while progress changes", async () => {
    const user = userEvent.setup();
    const initialValue = {
      deck,
      loading: false,
      error: null,
      studyProgress: {},
      appSettings: createSettings({ dailyNewLimit: 2 }),
      updateWordProgress: vi
        .fn<(wordId: number, grade: ReviewGrade) => WordProgress>()
        .mockReturnValue(createProgress({ bucket: 2, status: "review" })),
      recordSession: vi.fn(),
    };
    mockUseWords.mockReturnValue(initialValue);

    const { rerender } = render(<StudyPage />);
    expect(await screen.findByText("Card 1 / 2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Good" }));

    mockUseWords.mockReturnValue({
      ...initialValue,
      studyProgress: {
        3: createProgress({ bucket: 2, status: "review" }),
      },
    });
    rerender(<StudyPage />);

    expect(screen.getByText("Card 2 / 2")).toBeInTheDocument();
    expect(screen.getByText("abuse")).toBeInTheDocument();
  });
});
