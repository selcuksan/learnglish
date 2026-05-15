import { randomItems } from "./utils";
import type { StudyProgress, Word } from "../types";
import { getDueWords, getNewWords } from "./spacedRepetition";

export type QuizCard = {
  prompt: Word;
  options: Word[];
};

const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "into",
  "is",
  "it",
  "of",
  "on",
  "or",
  "someone",
  "something",
  "the",
  "their",
  "them",
  "there",
  "this",
  "to",
  "way",
  "with",
]);

export function createQuiz(
  words: Word[],
  allWords: Word[],
  size: number,
): QuizCard[] {
  return words.slice(0, size).map((word) => {
    const distractors = chooseDistractors(word, allWords, 3);
    const options = randomItems([word, ...distractors], 4);
    return { prompt: word, options };
  });
}

export function buildQuizSource(deck: Word[], studyProgress: StudyProgress) {
  const dueWords = getDueWords(deck, studyProgress);
  const newWords = getNewWords(deck, studyProgress);
  const dueIDs = new Set(dueWords.map((word) => word.id));
  const randomizedDueWords = randomItems(dueWords, dueWords.length);
  const randomizedNewWords = randomItems(
    newWords.filter((word) => !dueIDs.has(word.id)),
    newWords.length,
  );

  return [...randomizedDueWords, ...randomizedNewWords].slice(0, 24);
}

export function chooseDistractors(
  target: Word,
  allWords: Word[],
  count: number,
) {
  const targetDefinitionTokens = tokenize(target.definition);
  const targetWordTokens = tokenize(target.word);

  const ranked = allWords
    .filter((candidate) => candidate.id !== target.id)
    .map((candidate) => ({
      candidate,
      score: similarityScore(
        target,
        targetDefinitionTokens,
        targetWordTokens,
        candidate,
      ),
    }))
    .sort((left, right) => right.score - left.score);

  const semantic = ranked
    .filter((item) => item.score > 0)
    .map((item) => item.candidate);

  const semanticIDs = new Set(semantic.map((word) => word.id));
  const fallback = randomItems(
    allWords.filter(
      (candidate) =>
        candidate.id !== target.id && !semanticIDs.has(candidate.id),
    ),
    count,
  );

  return [...semantic.slice(0, count), ...fallback].slice(0, count);
}

function similarityScore(
  target: Word,
  targetDefinitionTokens: Set<string>,
  targetWordTokens: Set<string>,
  candidate: Word,
) {
  const candidateDefinitionTokens = tokenize(candidate.definition);
  const candidateWordTokens = tokenize(candidate.word);

  let score = 0;
  score += overlapCount(targetDefinitionTokens, candidateDefinitionTokens) * 4;
  score += overlapCount(targetWordTokens, candidateWordTokens) * 2;

  if (sharePrefix(target.word, candidate.word)) {
    score += 1;
  }

  return score;
}

function tokenize(value: string) {
  return new Set(
    value
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2 && !stopWords.has(token)),
  );
}

function overlapCount(left: Set<string>, right: Set<string>) {
  let count = 0;
  left.forEach((token) => {
    if (right.has(token)) {
      count += 1;
    }
  });
  return count;
}

function sharePrefix(left: string, right: string) {
  const a = left.toLowerCase();
  const b = right.toLowerCase();
  return a.slice(0, 3) === b.slice(0, 3);
}
