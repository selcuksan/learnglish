import type { ReviewGrade, ReviewStatus, Word, WordProgress } from "../types";

const intervals = [0, 1, 3, 7, 14, 30];

export function getDefaultProgress(): WordProgress {
  return {
    status: "new",
    bucket: 0,
    nextReviewAt: null,
    lastReviewedAt: null,
    reviewCount: 0,
    correctCount: 0,
    failCount: 0,
    lastFailedAt: null,
  };
}

export function applyReview(
  existing: WordProgress,
  grade: ReviewGrade,
  now = new Date(),
): WordProgress {
  let nextBucket = existing.bucket;
  let nextStatus: ReviewStatus = "learning";

  switch (grade) {
    case "again":
      nextBucket = 0;
      nextStatus = "learning";
      break;
    case "hard":
      nextBucket = Math.max(1, existing.bucket);
      nextStatus = "learning";
      break;
    case "good":
      nextBucket = Math.min(intervals.length - 1, existing.bucket + 1);
      nextStatus = nextBucket >= 2 ? "review" : "learning";
      break;
    case "easy":
      nextBucket = Math.min(intervals.length - 1, existing.bucket + 2);
      nextStatus = "review";
      break;
  }

  const nextReviewAt = new Date(now);
  nextReviewAt.setDate(nextReviewAt.getDate() + intervals[nextBucket]);

  return {
    status: nextStatus,
    bucket: nextBucket,
    nextReviewAt: nextReviewAt.toISOString(),
    lastReviewedAt: now.toISOString(),
    reviewCount: existing.reviewCount + 1,
    correctCount: existing.correctCount + (grade === "again" ? 0 : 1),
    failCount: existing.failCount + (grade === "again" ? 1 : 0),
    lastFailedAt: grade === "again" ? now.toISOString() : existing.lastFailedAt,
  };
}

export function getDueWords(
  words: Word[],
  progress: Record<number, WordProgress>,
  now = new Date(),
) {
  return words.filter((word) => {
    const item = progress[word.id];
    return Boolean(item?.nextReviewAt && new Date(item.nextReviewAt) <= now);
  });
}

export function getNewWords(
  words: Word[],
  progress: Record<number, WordProgress>,
) {
  return words.filter(
    (word) => !progress[word.id] || progress[word.id]?.status === "new",
  );
}

export function getCompletionRatio(
  words: Word[],
  progress: Record<number, WordProgress>,
) {
  if (!words.length) {
    return 0;
  }

  const active = words.filter(
    (word) => progress[word.id] && progress[word.id].reviewCount > 0,
  ).length;
  return active / words.length;
}

export function getMistakeWords(
  words: Word[],
  progress: Record<number, WordProgress>,
) {
  return words
    .filter((word) => (progress[word.id]?.failCount ?? 0) > 0)
    .sort((a, b) => {
      const left = progress[a.id];
      const right = progress[b.id];
      if (!left || !right) {
        return 0;
      }

      if (right.failCount !== left.failCount) {
        return right.failCount - left.failCount;
      }

      const leftTime = left.lastFailedAt
        ? new Date(left.lastFailedAt).getTime()
        : 0;
      const rightTime = right.lastFailedAt
        ? new Date(right.lastFailedAt).getTime()
        : 0;
      return rightTime - leftTime;
    });
}
