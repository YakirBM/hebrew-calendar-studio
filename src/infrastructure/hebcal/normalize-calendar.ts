import type {
  CalendarDay,
  CalendarEvent,
  CalendarEventType,
} from "@/domain/calendar/types";
import type { HebcalItem } from "./contract";

const STATE_TITLES = new Set(["Yom HaShoah", "Yom HaZikaron", "Yom HaAtzma'ut"]);
const STATE_LABELS: Record<string, string> = {
  "Yom HaShoah": "יום השואה",
  "Yom HaZikaron": "יום הזיכרון",
  "Yom HaAtzma'ut": "יום העצמאות",
};

const getEventType = (item: HebcalItem, stableTitle: string): CalendarEventType => {
  if (item.category === "parashat") return "parsha";
  if (item.category === "roshchodesh") return "roshchodesh";
  if (item.subcat === "fast") return "fast";
  if (item.subcat === "modern") {
    return STATE_TITLES.has(stableTitle) ? "state" : "modern";
  }
  if (item.subcat === "shabbat") return "special";
  if (item.subcat === "major") return "major";
  return "minor";
};

export const normalizeEvent = (item: HebcalItem): CalendarEvent => {
  const stableTitle = item.title_orig ?? item.title ?? "";
  const type = getEventType(item, stableTitle);
  let label = item.hebrew ?? item.title ?? "אירוע";
  label = label.replace(/\s+\d{4}$/, "");
  if (type === "parsha") label = label.replace(/^פרשת\s+/, "");
  if (type === "roshchodesh") label = "ראש חודש";
  if (type === "state") label = STATE_LABELS[stableTitle] ?? label;
  return { type, label, title: stableTitle, category: item.category ?? "" };
};

export const normalizeCalendarItems = (items: HebcalItem[]): CalendarDay[] => {
  const days = new Map<string, CalendarDay>();

  items.forEach((item) => {
    const date = item.date?.slice(0, 10);
    if (!date) return;
    const day = days.get(date) ?? {
      date,
      hebrew: "",
      heDateParts: null,
      events: [],
    };

    if (item.category === "hebdate") {
      day.hebrew = item.hebrew ?? item.hdate ?? "";
      day.heDateParts = item.heDateParts ?? null;
    } else if (item.category !== "mevarchim") {
      day.events.push(normalizeEvent(item));
    }
    days.set(date, day);
  });

  return [...days.values()].sort((left, right) => left.date.localeCompare(right.date));
};
