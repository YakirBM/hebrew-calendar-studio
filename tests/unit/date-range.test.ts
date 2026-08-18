import { describe, expect, it } from "vitest";
import {
  alignRange,
  formatIsoDate,
  getTotalWeeks,
  parseIsoDate,
  validateRange,
} from "@/domain/calendar/date-range";

describe("date range", () => {
  it("aligns every requested range to complete Sunday-Saturday weeks", () => {
    const validation = validateRange("2026-08-18", "2027-01-16");
    expect(validation.ok).toBe(true);
    if (!validation.ok) return;
    const aligned = alignRange(validation.range);
    expect(formatIsoDate(aligned.start)).toBe("2026-08-16");
    expect(formatIsoDate(aligned.end)).toBe("2027-01-16");
    expect(aligned.start.getDay()).toBe(0);
    expect(aligned.end.getDay()).toBe(6);
    expect(getTotalWeeks(aligned.start, aligned.end)).toBe(22);
  });

  it("rejects invalid and overlong ranges", () => {
    expect(validateRange("2026-02-30", "2026-03-01").ok).toBe(false);
    expect(validateRange("2027-01-01", "2026-01-01").ok).toBe(false);
    expect(validateRange("2026-01-01", "2030-01-01").ok).toBe(false);
    expect(parseIsoDate("not-a-date")).toBeNull();
  });
});
