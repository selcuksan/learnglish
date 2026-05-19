import { describe, expect, it } from "vitest";

import {
  applyReview,
  getDefaultProgress,
  getMemoryStage,
  getMistakeWords,
  previewReview,
} from "./spacedRepetition";
import type { Word } from "../types";

const words: Word[] = [
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
    word: "activity",
    definition: "an action or task",
    slug: "activity",
    exampleSentence: "Reading together is a calm evening activity.",
  },
];

describe("spacedRepetition", () => {
  it("tracks fail counters when a review is graded again", () => {
    const progress = applyReview(
      getDefaultProgress(),
      "again",
      new Date("2026-05-15T10:00:00Z"),
    );

    expect(progress.failCount).toBe(1);
    expect(progress.lastFailedAt).toBe("2026-05-15T10:00:00.000Z");
    expect(progress.correctCount).toBe(0);
  });

  it("sorts mistake words by fail count and recency", () => {
    const progress = {
      1: {
        ...getDefaultProgress(),
        failCount: 2,
        lastFailedAt: "2026-05-15T10:00:00.000Z",
      },
      2: {
        ...getDefaultProgress(),
        failCount: 2,
        lastFailedAt: "2026-05-15T12:00:00.000Z",
      },
      3: {
        ...getDefaultProgress(),
        failCount: 1,
        lastFailedAt: "2026-05-15T11:00:00.000Z",
      },
    };

    expect(getMistakeWords(words, progress).map((word) => word.id)).toEqual([
      2, 1, 3,
    ]);
  });

  it("maps buckets to user-facing memory stages", () => {
    expect(getMemoryStage(0)).toEqual({
      label: "Fresh",
      detail: "review again today",
    });
    expect(getMemoryStage(4)).toEqual({
      label: "Stable",
      detail: "review in 14 days",
    });
    expect(getMemoryStage(99)).toEqual({
      label: "Long-term",
      detail: "review in 30 days",
    });
  });

  it("previews grade effects without changing review math", () => {
    expect(previewReview(getDefaultProgress(), "easy").bucket).toBe(2);
    expect(previewReview(getDefaultProgress(), "again").bucket).toBe(0);
  });
});
