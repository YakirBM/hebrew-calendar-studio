import type { CalendarSettings } from "@/domain/print/types";
import { createDefaultSettings } from "@/domain/print/presets";

const SETTINGS_KEY = "seder-yom-settings-v2";
const LEGACY_SETTINGS_KEY = "seder-yom-settings-v1";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export const loadSettings = (): CalendarSettings => {
  const defaults = createDefaultSettings();
  if (typeof window === "undefined") return defaults;

  try {
    const raw =
      window.localStorage.getItem(SETTINGS_KEY) ??
      window.localStorage.getItem(LEGACY_SETTINGS_KEY);
    if (!raw) return defaults;
    const candidate: unknown = JSON.parse(raw);
    if (!isRecord(candidate)) return defaults;
    return { ...defaults, ...candidate } as CalendarSettings;
  } catch {
    return defaults;
  }
};

export const saveSettings = (settings: CalendarSettings): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const clearSavedSettings = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SETTINGS_KEY);
};
