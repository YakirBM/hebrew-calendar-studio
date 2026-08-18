import { createDefaultDateRange } from "../calendar/date-range";
import type {
  CalendarSettings,
  Density,
  DesignPreset,
} from "./types";

type VisualSettings = Pick<
  CalendarSettings,
  | "calendarFont"
  | "headerColor"
  | "gridColor"
  | "textColor"
  | "holidayColor"
  | "noteColor"
  | "shadeSaturday"
>;

type DensitySettings = Pick<
  CalendarSettings,
  "bodySize" | "headerSize" | "pageMargin" | "headerHeight"
>;

export const DESIGN_PRESETS: Record<Exclude<DesignPreset, "custom">, VisualSettings> = {
  classic: {
    calendarFont: "Noto Sans Hebrew",
    headerColor: "#e9e5da",
    gridColor: "#1e2422",
    textColor: "#151918",
    holidayColor: "#762f27",
    noteColor: "#176b5b",
    shadeSaturday: true,
  },
  modern: {
    calendarFont: "Rubik",
    headerColor: "#dcebe6",
    gridColor: "#24483e",
    textColor: "#13251f",
    holidayColor: "#a33e2f",
    noteColor: "#146d84",
    shadeSaturday: true,
  },
  heritage: {
    calendarFont: "Noto Serif Hebrew",
    headerColor: "#ead9bc",
    gridColor: "#553f2e",
    textColor: "#2c2119",
    holidayColor: "#7e241f",
    noteColor: "#315d48",
    shadeSaturday: true,
  },
};

export const DENSITY_PRESETS: Record<Exclude<Density, "custom">, DensitySettings> = {
  comfortable: { bodySize: 9, headerSize: 20, pageMargin: 5, headerHeight: 10.5 },
  balanced: { bodySize: 7.75, headerSize: 18, pageMargin: 4, headerHeight: 9 },
  compact: { bodySize: 6.5, headerSize: 15, pageMargin: 3, headerHeight: 8 },
};

export const createDefaultSettings = (today = new Date()): CalendarSettings => ({
  ...createDefaultDateRange(today),
  region: "israel",
  paperSize: "a4",
  orientation: "portrait",
  paginationMode: "single",
  weeksPerPage: 22,
  outsideDays: "dim",
  density: "balanced",
  designPreset: "classic",
  showMajor: true,
  showMinor: true,
  showFasts: true,
  showRoshChodesh: true,
  showParasha: true,
  showSpecialShabbat: true,
  showStateDays: true,
  showAllModern: false,
  ...DENSITY_PRESETS.balanced,
  ...DESIGN_PRESETS.classic,
  gridWidth: 1,
  customEvents: "",
});

export const applyDensity = (
  settings: CalendarSettings,
  density: Exclude<Density, "custom">,
): CalendarSettings => ({ ...settings, density, ...DENSITY_PRESETS[density] });

export const applyDesignPreset = (
  settings: CalendarSettings,
  preset: Exclude<DesignPreset, "custom">,
): CalendarSettings => ({ ...settings, designPreset: preset, ...DESIGN_PRESETS[preset] });
