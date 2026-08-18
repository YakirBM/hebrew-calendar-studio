import type { Region } from "../calendar/types";

export type PaperSize = "a4" | "a3";
export type PaperOrientation = "portrait" | "landscape";
export type PaginationMode = "single" | "pages";
export type OutsideDaysMode = "dim" | "blank" | "show";
export type Density = "comfortable" | "balanced" | "compact" | "custom";
export type DesignPreset = "classic" | "modern" | "heritage" | "custom";

export type CalendarSettings = {
  startDate: string;
  endDate: string;
  region: Region;
  paperSize: PaperSize;
  orientation: PaperOrientation;
  paginationMode: PaginationMode;
  weeksPerPage: number;
  outsideDays: OutsideDaysMode;
  density: Density;
  designPreset: DesignPreset;
  showMajor: boolean;
  showMinor: boolean;
  showFasts: boolean;
  showRoshChodesh: boolean;
  showParasha: boolean;
  showSpecialShabbat: boolean;
  showStateDays: boolean;
  showAllModern: boolean;
  calendarFont: string;
  bodySize: number;
  headerSize: number;
  pageMargin: number;
  headerHeight: number;
  gridWidth: number;
  shadeSaturday: boolean;
  headerColor: string;
  gridColor: string;
  textColor: string;
  holidayColor: string;
  noteColor: string;
  customEvents: string;
};

export type PaperDimensions = {
  label: string;
  width: number;
  height: number;
  size: PaperSize;
  orientation: PaperOrientation;
};

export type AutoSizing = {
  rowHeight: number;
  cellPadding: number;
  cellPaddingX: number;
  bodySize: number;
  headerSize: number;
};

export type LayoutPlan = {
  totalWeeks: number;
  rowsPerPage: number;
  pageCount: number;
  singlePage: boolean;
  paper: PaperDimensions;
  sizing: AutoSizing;
};
