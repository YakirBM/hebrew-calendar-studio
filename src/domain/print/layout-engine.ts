import { getPaperDimensions } from "./paper";
import type { AutoSizing, CalendarSettings, LayoutPlan } from "./types";

export const MIN_AUTO_FONT_PT = 3.5;
export const MIN_COMFORTABLE_FONT_PT = 5.5;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const computeAutoSizing = (
  rowCount: number,
  settings: CalendarSettings,
): AutoSizing => {
  const paper = getPaperDimensions(settings.paperSize, settings.orientation);
  const usableHeight = Math.max(20, paper.height - settings.pageMargin * 2);
  const rowHeight = Math.max(
    0.8,
    (usableHeight - settings.headerHeight) / Math.max(1, rowCount),
  );
  const cellPadding = clamp(rowHeight * 0.07, 0.24, 0.95);
  const cellPaddingX = clamp(rowHeight * 0.085, 0.55, 1.15);
  const fontByHeight =
    (rowHeight - cellPadding * 2) / (3.05 * 1.16 * 0.352778);
  const bodySize =
    Math.round(
      clamp(
        Math.min(settings.bodySize, fontByHeight),
        MIN_AUTO_FONT_PT,
        settings.bodySize,
      ) * 4,
    ) / 4;
  const headerLimit = Math.max(
    8,
    (settings.headerHeight - 1.1) / 0.352778,
  );
  const headerSize =
    Math.round(Math.min(settings.headerSize, headerLimit) * 2) / 2;

  return { rowHeight, cellPadding, cellPaddingX, bodySize, headerSize };
};

export const createLayoutPlan = (
  totalWeeks: number,
  settings: CalendarSettings,
): LayoutPlan => {
  const singlePage = settings.paginationMode === "single";
  const rowsPerPage = singlePage ? totalWeeks : settings.weeksPerPage;
  return {
    totalWeeks,
    rowsPerPage,
    pageCount: singlePage ? 1 : Math.ceil(totalWeeks / rowsPerPage),
    singlePage,
    paper: getPaperDimensions(settings.paperSize, settings.orientation),
    sizing: computeAutoSizing(rowsPerPage, settings),
  };
};
