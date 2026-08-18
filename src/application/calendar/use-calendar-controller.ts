"use client";

import { useCallback, useEffect } from "react";
import type { CalendarPayload, PersonalNote } from "@/domain/calendar/types";
import { alignRange, formatIsoDate, validateRange } from "@/domain/calendar/date-range";
import { useCalendarStore } from "@/state/calendar-store";
import { useSettingsStore } from "@/state/settings-store";
import {
  loadCachedCalendar,
  saveCachedCalendar,
} from "@/infrastructure/storage/calendar-cache.repository";
import { migrateLegacyNotes } from "@/infrastructure/storage/legacy-migration";
import { loadNotes, saveNotes } from "@/infrastructure/storage/notes.repository";

export const useCalendarController = () => {
  const settings = useSettingsStore((state) => state.settings);
  const hydrated = useSettingsStore((state) => state.hydrated);
  const hydrateSettings = useSettingsStore((state) => state.hydrate);
  const status = useCalendarStore((state) => state.status);
  const setStatus = useCalendarStore((state) => state.setStatus);
  const setPayload = useCalendarStore((state) => state.setPayload);
  const notes = useCalendarStore((state) => state.notes);
  const setNotes = useCalendarStore((state) => state.setNotes);

  useEffect(() => {
    hydrateSettings();
    void migrateLegacyNotes().then(async () => setNotes(await loadNotes()));
  }, [hydrateSettings, setNotes]);

  const generate = useCallback(async () => {
    const validation = validateRange(settings.startDate, settings.endDate);
    if (!validation.ok) {
      setStatus("error", validation.message);
      return false;
    }

    setStatus("loading", "טוען ומאמת נתוני לוח…");
    const params = new URLSearchParams({
      start: settings.startDate,
      end: settings.endDate,
      region: settings.region,
    });

    try {
      const response = await fetch(`/api/calendar?${params.toString()}`);
      if (!response.ok) throw new Error(`Calendar API returned ${response.status}`);
      const payload = (await response.json()) as CalendarPayload;
      setPayload(payload);
      setStatus("online", "הנתונים אומתו מול Hebcal והלוח מוכן לעריכה.");
      // Cache persistence is best-effort. A blocked IndexedDB must never turn a
      // successful verified network response into a false connectivity error.
      await saveCachedCalendar(payload).catch(() => undefined);
      return true;
    } catch {
      const validRange = validateRange(settings.startDate, settings.endDate);
      if (!validRange.ok) return false;
      const { start, end } = alignRange(validRange.range);
      const cached = await loadCachedCalendar(
        settings.startDate,
        settings.endDate,
        settings.region,
      );
      if (
        cached &&
        cached.alignedStart === formatIsoDate(start) &&
        cached.alignedEnd === formatIsoDate(end)
      ) {
        setPayload(cached);
        setStatus("cached", "אין חיבור. מוצג עותק מקומי שאומת בעבר.");
        return true;
      }
      setStatus("error", "לא ניתן לטעון את הלוח ואין עותק מקומי לטווח הזה.");
      return false;
    }
  }, [settings, setPayload, setStatus]);

  const upsertNote = useCallback(
    async (date: string, note: PersonalNote) => {
      const existing = notes[date] ?? [];
      const nextForDate = existing.some((item) => item.id === note.id)
        ? existing.map((item) => (item.id === note.id ? note : item))
        : [...existing, note];
      const next = { ...notes, [date]: nextForDate };
      setNotes(next);
      await saveNotes(next);
    },
    [notes, setNotes],
  );

  const removeNote = useCallback(
    async (date: string, id: string) => {
      const remaining = (notes[date] ?? []).filter((note) => note.id !== id);
      const next = { ...notes, [date]: remaining };
      if (remaining.length === 0) delete next[date];
      setNotes(next);
      await saveNotes(next);
    },
    [notes, setNotes],
  );

  return { generate, upsertNote, removeNote, hydrated, status };
};
