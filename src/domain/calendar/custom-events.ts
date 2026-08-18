import { parseIsoDate } from "./date-range";
import type { CustomEvent } from "./types";

export type ParsedCustomEvents = {
  events: CustomEvent[];
  errors: number[];
};

export const parseCustomEvents = (value: string): ParsedCustomEvents => {
  const events: CustomEvent[] = [];
  const errors: number[] = [];

  value.split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) return;
    const match = /^(\d{4}-\d{2}-\d{2})\s*\|\s*(.+)$/.exec(line);
    if (!match || !parseIsoDate(match[1] ?? "")) {
      errors.push(index + 1);
      return;
    }
    events.push({ date: match[1] ?? "", label: (match[2] ?? "").trim() });
  });

  return { events, errors };
};

export const groupCustomEvents = (events: CustomEvent[]): Map<string, string[]> => {
  const grouped = new Map<string, string[]>();
  events.forEach(({ date, label }) => {
    grouped.set(date, [...(grouped.get(date) ?? []), label]);
  });
  return grouped;
};
