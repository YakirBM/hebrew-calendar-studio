import { createStore, get, set } from "idb-keyval";
import type { CalendarPayload, Region } from "@/domain/calendar/types";

type CacheEntry = { key: string; payload: CalendarPayload; savedAt: string };

const cacheStore = createStore("seder-yom-studio", "calendar-cache");
const CACHE_KEY = "entries-v1";
const MAX_ENTRIES = 10;

export const calendarCacheKey = (
  start: string,
  end: string,
  region: Region,
): string => `${start}|${end}|${region}`;

const loadEntries = async (): Promise<CacheEntry[]> => {
  if (typeof indexedDB === "undefined") return [];
  try {
    return (await get<CacheEntry[]>(CACHE_KEY, cacheStore)) ?? [];
  } catch {
    return [];
  }
};

export const loadCachedCalendar = async (
  start: string,
  end: string,
  region: Region,
): Promise<CalendarPayload | null> => {
  const entries = await loadEntries();
  return entries.find((entry) => entry.key === calendarCacheKey(start, end, region))
    ?.payload ?? null;
};

export const saveCachedCalendar = async (
  payload: CalendarPayload,
): Promise<void> => {
  if (typeof indexedDB === "undefined") return;
  const key = calendarCacheKey(
    payload.requestedStart,
    payload.requestedEnd,
    payload.region,
  );
  const current = (await loadEntries()).filter((entry) => entry.key !== key);
  current.unshift({ key, payload, savedAt: new Date().toISOString() });
  await set(CACHE_KEY, current.slice(0, MAX_ENTRIES), cacheStore);
};
