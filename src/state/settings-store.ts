"use client";

import { create } from "zustand";
import {
  applyDensity,
  applyDesignPreset,
  createDefaultSettings,
} from "@/domain/print/presets";
import type {
  CalendarSettings,
  Density,
  DesignPreset,
} from "@/domain/print/types";
import {
  clearSavedSettings,
  loadSettings,
  saveSettings,
} from "@/infrastructure/storage/settings.repository";

type SettingsState = {
  settings: CalendarSettings;
  hydrated: boolean;
  hydrate: () => void;
  update: (patch: Partial<CalendarSettings>) => void;
  chooseDensity: (density: Exclude<Density, "custom">) => void;
  choosePreset: (preset: Exclude<DesignPreset, "custom">) => void;
  replace: (settings: CalendarSettings) => void;
  reset: () => void;
};

const densityKeys = new Set<keyof CalendarSettings>([
  "bodySize",
  "headerSize",
  "pageMargin",
  "headerHeight",
]);
const visualKeys = new Set<keyof CalendarSettings>([
  "calendarFont",
  "headerColor",
  "gridColor",
  "textColor",
  "holidayColor",
  "noteColor",
  "shadeSaturday",
]);

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: createDefaultSettings(),
  hydrated: false,
  hydrate: () => set({ settings: loadSettings(), hydrated: true }),
  update: (patch) => {
    const keys = Object.keys(patch) as (keyof CalendarSettings)[];
    const next = {
      ...get().settings,
      ...patch,
      ...(keys.some((key) => densityKeys.has(key)) ? { density: "custom" as const } : {}),
      ...(keys.some((key) => visualKeys.has(key))
        ? { designPreset: "custom" as const }
        : {}),
    };
    saveSettings(next);
    set({ settings: next });
  },
  chooseDensity: (density) => {
    const next = applyDensity(get().settings, density);
    saveSettings(next);
    set({ settings: next });
  },
  choosePreset: (preset) => {
    const next = applyDesignPreset(get().settings, preset);
    saveSettings(next);
    set({ settings: next });
  },
  replace: (settings) => {
    saveSettings(settings);
    set({ settings });
  },
  reset: () => {
    clearSavedSettings();
    const settings = createDefaultSettings();
    saveSettings(settings);
    set({ settings });
  },
}));
