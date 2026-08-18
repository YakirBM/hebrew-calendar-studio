import { describe, expect, it } from "vitest";
import { parseCustomEvents } from "@/domain/calendar/custom-events";

describe("custom events parser", () => {
  it("accepts dated labels and reports malformed lines", () => {
    const result = parseCustomEvents("2026-12-25 | Christmas\nwrong\n2027-01-01 | New Year");
    expect(result.events).toHaveLength(2);
    expect(result.errors).toEqual([2]);
  });
});
