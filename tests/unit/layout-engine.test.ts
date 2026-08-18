import { describe, expect, it } from "vitest";
import { createLayoutPlan, MIN_AUTO_FONT_PT } from "@/domain/print/layout-engine";
import { createDefaultSettings } from "@/domain/print/presets";

describe("print layout engine", () => {
  it.each([
    ["a4", "portrait", 52, 210, 297],
    ["a4", "landscape", 52, 297, 210],
    ["a3", "portrait", 52, 297, 420],
    ["a3", "landscape", 52, 420, 297],
  ] as const)("fits %s %s into one page with equal positive rows", (paperSize, orientation, weeks, width, height) => {
    const settings = { ...createDefaultSettings(), paperSize, orientation, paginationMode: "single" as const };
    const plan = createLayoutPlan(weeks, settings);
    expect(plan.pageCount).toBe(1);
    expect(plan.rowsPerPage).toBe(52);
    expect(plan.paper.width).toBe(width);
    expect(plan.paper.height).toBe(height);
    expect(plan.sizing.rowHeight).toBeGreaterThan(0);
    expect(plan.sizing.bodySize).toBeGreaterThanOrEqual(MIN_AUTO_FONT_PT);
  });

  it("uses explicit page splitting only when selected", () => {
    const settings = { ...createDefaultSettings(), paginationMode: "pages" as const, weeksPerPage: 12 };
    const plan = createLayoutPlan(52, settings);
    expect(plan.pageCount).toBe(5);
    expect(plan.rowsPerPage).toBe(12);
  });
});
