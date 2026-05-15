import type { Meta, Word, WordsResponse } from "../types";

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export function fetchMeta() {
  return fetchJSON<Meta>("/api/meta");
}

export function fetchDeck() {
  return fetchJSON<Word[]>("/api/deck");
}

export function fetchWords(search: string, limit: number, offset: number) {
  const params = new URLSearchParams({
    search,
    limit: String(limit),
    offset: String(offset),
  });

  return fetchJSON<WordsResponse>(`/api/words?${params.toString()}`);
}
