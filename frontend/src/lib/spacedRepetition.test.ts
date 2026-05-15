import { describe, expect, it } from "vitest";

import {
  applyReview,
  getDefaultProgress,
  getMistakeWords,
} from "./spacedRepetition";
import type { Word } from "../types";

const words: Word[] = [
  {
    id: 1,
    word: "habit",
    definition: "the usual way of behaving",
    slug: "habit",
  },
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
});
