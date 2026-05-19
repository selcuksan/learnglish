import type { Meta, Word, WordsResponse } from "../types";

const dataMode = import.meta.env.VITE_DATA_MODE;
const staticBase = `${import.meta.env.BASE_URL}data`;

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export function fetchMeta() {
  if (dataMode === "static") {
    return fetchJSON<Meta>(`${staticBase}/meta.json`);
  }

  return fetchJSON<Meta>("/api/meta");
}

export function fetchDeck() {
  if (dataMode === "static") {
    return fetchJSON<Word[]>(`${staticBase}/words.json`);
  }

  return fetchJSON<Word[]>("/api/deck");
}

export function fetchWords(search: string, limit: number, offset: number) {
  if (dataMode === "static") {
    return fetchStaticWords(search, limit, offset);
  }

  const params = new URLSearchParams({
    search,
    limit: String(limit),
    offset: String(offset),
  });

  return fetchJSON<WordsResponse>(`/api/words?${params.toString()}`);
}

async function fetchStaticWords(
  search: string,
  limit: number,
  offset: number,
): Promise<WordsResponse> {
  const words = await fetchDeck();
  const query = search.trim().toLowerCase();
  const filtered = query
    ? words.filter(
        (word) =>
          word.word.toLowerCase().includes(query) ||
          word.definition.toLowerCase().includes(query),
      )
    : words;

  return {
    items: filtered.slice(offset, offset + limit),
    total: filtered.length,
    limit,
    offset,
  };
}
