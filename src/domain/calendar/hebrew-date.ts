import type { CalendarDay } from "./types";

export const formatHebrewDate = (day: CalendarDay): string => {
  const { d, m } = day.heDateParts ?? {};
  return d && m ? `${d} ${m}` : day.hebrew;
};

export const isHebrewMonthStart = (day: CalendarDay): boolean => {
  const firstPart = day.heDateParts?.d ?? day.hebrew.split(/\s+/)[0] ?? "";
  return firstPart === "1" || /^א[׳']?$/.test(firstPart);
};
