import { describe, expect, it } from "vitest";
import { normalizeCalendarItems, normalizeEvent } from "@/infrastructure/hebcal/normalize-calendar";
import { formatHebrewDate, isHebrewMonthStart } from "@/domain/calendar/hebrew-date";

describe("Hebcal normalization", () => {
  it("preserves Hebrew leap-month date parts", () => {
    const days = normalizeCalendarItems([{
      title: "27th of Adar II, 5787",
      date: "2027-04-05",
      category: "hebdate",
      hebrew: "כ״ז אַדָר ב׳ תשפ״ז",
      heDateParts: { d: "27", m: "Adar2", y: "5787" },
    }]);
    expect(days[0]?.heDateParts?.m).toBe("Adar2");
    expect(days[0]?.hebrew).toContain("אַדָר ב׳");
  });

  it("maps Israeli state days and parashot to concise Hebrew labels", () => {
    expect(normalizeEvent({ title: "Yom HaAtzma'ut", title_orig: "Yom HaAtzma'ut", date: "2027-05-12", category: "holiday", subcat: "modern" }).label).toBe("יום העצמאות");
    expect(normalizeEvent({ title: "Parashat Noach", date: "2026-10-17", category: "parashat", hebrew: "פרשת נח" }).label).toBe("נח");
  });

  it("marks both Hebcal rosh-chodesh days consistently", () => {
    const event = normalizeEvent({ title: "Rosh Chodesh Kislev", date: "2026-11-10", category: "roshchodesh", hebrew: "ראש חודש כסלו" });
    expect(event.type).toBe("roshchodesh");
    expect(event.label).toBe("ראש חודש");
  });

  it("formats the first of a Hebrew month without the year and highlights it", () => {
    const day = { date: "2026-09-12", hebrew: "א׳ תשרי תשפ״ז", heDateParts: { d: "א׳", m: "תשרי", y: "תשפ״ז" }, events: [] };
    expect(formatHebrewDate(day)).toBe("א׳ תשרי");
    expect(isHebrewMonthStart(day)).toBe(true);
  });
});
