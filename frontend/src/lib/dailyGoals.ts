import type { SessionHistoryItem } from "../types";

export type DailyGoalProgress = {
  reviewed: number;
  newLearned: number;
};

export function getTodayProgress(
  sessionHistory: SessionHistoryItem[],
  now = new Date(),
): DailyGoalProgress {
  return sessionHistory.reduce(
    (acc, session) => {
      if (!isSameDay(new Date(session.completedAt), now)) {
        return acc;
      }

      acc.reviewed += session.reviewed;
      acc.newLearned += session.newLearned;
      return acc;
    },
    { reviewed: 0, newLearned: 0 },
  );
}

export function getGoalRatio(value: number, goal: number) {
  if (goal <= 0) {
    return 0;
  }
  return Math.min(1, value / goal);
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}
