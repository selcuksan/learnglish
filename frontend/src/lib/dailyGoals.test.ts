import { describe, expect, it } from "vitest";

import { getGoalRatio, getTodayProgress } from "./dailyGoals";
import type { SessionHistoryItem } from "../types";

const history: SessionHistoryItem[] = [
  {
    id: "1",
    kind: "study",
    completedAt: "2026-05-15T09:00:00.000Z",
    total: 10,
    correct: 8,
    reviewed: 10,
    newLearned: 4,
  },
  {
    id: "2",
    kind: "quiz",
    completedAt: "2026-05-15T12:00:00.000Z",
    total: 6,
    correct: 5,
    reviewed: 6,
    newLearned: 0,
  },
  {
    id: "3",
    kind: "mistakes",
    completedAt: "2026-05-14T12:00:00.000Z",
    total: 4,
    correct: 2,
    reviewed: 4,
    newLearned: 0,
  },
];

describe("dailyGoals", () => {
  it("aggregates today's reviewed and new words", () => {
    expect(
      getTodayProgress(history, new Date("2026-05-15T18:00:00.000Z")),
    ).toEqual({
      reviewed: 16,
      newLearned: 4,
    });
  });

  it("caps goal ratio at 100 percent", () => {
    expect(getGoalRatio(30, 20)).toBe(1);
    expect(getGoalRatio(5, 20)).toBe(0.25);
  });
});
