import { describe, expect, it, vi } from "vitest";

import { buildQuizSource, chooseDistractors, createQuiz } from "./quiz";
import type { Word } from "../types";

vi.mock("./utils", async () => {
  const actual = await vi.importActual<typeof import("./utils")>("./utils");
  return {
    ...actual,
    randomItems: <T>(items: T[], count: number) =>
      [...items].reverse().slice(0, count),
  };
});

const deck: Word[] = [
  {
    id: 1,
    word: "habit",
    definition: "the usual way of behaving and a repeated custom",
    slug: "habit",
  },
  {
    id: 2,
    word: "routine",
    definition: "a usual repeated way of acting or behaving",
    slug: "routine",
  },
  {
    id: 3,
    word: "custom",
    definition: "a traditional way of behaving or doing something",
    slug: "custom",
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
    id: 6,
    word: "culture",
    definition: "the beliefs and customs of a group",
    slug: "culture",
  },
];

describe("quiz helpers", () => {
  it("prioritizes semantically close distractors", () => {
    const distractors = chooseDistractors(deck[0], deck, 3);
    expect(distractors.map((word) => word.word)).toEqual(
      expect.arrayContaining(["routine", "custom"]),
    );
  });

  it("builds a shuffled quiz source instead of taking the first alphabetical block", () => {
    const source = buildQuizSource(deck, {});
    expect(source[0].word).toBe("culture");
  });

  it("creates quiz cards that keep the correct answer and three distractors", () => {
    const cards = createQuiz([deck[0]], deck, 1);
    expect(cards).toHaveLength(1);
    expect(cards[0].options).toHaveLength(4);
    expect(cards[0].options.map((word) => word.id)).toContain(deck[0].id);
  });
});
