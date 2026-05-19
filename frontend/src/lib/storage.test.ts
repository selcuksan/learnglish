import { describe, expect, it } from "vitest";

import { sanitizePersistedState, serializeState } from "./storage";

describe("storage helpers", () => {
  it("sanitizes imported persisted state with defaults", () => {
    const state = sanitizePersistedState({
      studyProgress: {
        10: {
          status: "learning",
          bucket: 1,
          nextReviewAt: null,
          lastReviewedAt: null,
          reviewCount: 2,
          correctCount: 1,
          failCount: 1,
          lastFailedAt: null,
        },
      },
      appSettings: {
        dailyNewLimit: 9,
        dailyReviewGoal: 24,
        dailyNewGoal: 6,
        quizSize: 7,
        quizMode: "word-to-definition",
      },
      sessionHistory: [
        {
          id: "abc",
          kind: "quiz",
          completedAt: "2026-05-15T10:00:00.000Z",
          total: 8,
          correct: 6,
          reviewed: 8,
          newLearned: 0,
        },
      ],
    });

    expect(state.appSettings.quizMode).toBe("word-to-definition");
    expect(state.sessionHistory[0].reviewed).toBe(8);
    expect(state.studyProgress[10].failCount).toBe(1);
  });

  it("serializes state as readable json", () => {
    const output = serializeState(
      sanitizePersistedState({
        studyProgress: {},
        appSettings: {},
        sessionHistory: [],
      }),
    );

    expect(output).toContain('"version": 1');
    expect(output).toContain('"studyProgress": {}');
  });
});
