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

/**
 * Count consecutive days with at least one session, going backwards from today.
 * Today counts as day 1 if there is activity.
 */
export function getStreak(
  sessionHistory: SessionHistoryItem[],
  now = new Date(),
): number {
  if (sessionHistory.length === 0) {
    return 0;
  }

  const activeDays = new Set<string>();
  for (const session of sessionHistory) {
    const date = new Date(session.completedAt);
    activeDays.add(
      `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
    );
  }

  let streak = 0;
  const check = new Date(now);

  for (let i = 0; i < 365; i++) {
    const key = `${check.getFullYear()}-${check.getMonth()}-${check.getDate()}`;
    if (activeDays.has(key)) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else if (i === 0) {
      // Today has no activity yet, check if yesterday was active
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
