import type { SignalAnalysis } from "@/types/signal";

interface CacheEntry {
  data: SignalAnalysis;
  fetchedAt: number;
}

const TTL = 60 * 60 * 1000; // 1 hour

const cache = new Map<string, CacheEntry>();

export function getCached(pair: string): SignalAnalysis | null {
  const entry = cache.get(pair);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > TTL) {
    cache.delete(pair);
    return null;
  }
  return entry.data;
}

export function setCached(pair: string, data: SignalAnalysis): void {
  cache.set(pair, { data, fetchedAt: Date.now() });
}

export function getAllCached(): Record<string, SignalAnalysis | null> {
  const result: Record<string, SignalAnalysis | null> = {};
  for (const [pair, entry] of cache) {
    const fresh = Date.now() - entry.fetchedAt <= TTL;
    result[pair] = fresh ? entry.data : null;
  }
  return result;
}

export function isStale(pair: string): boolean {
  return getCached(pair) === null;
}