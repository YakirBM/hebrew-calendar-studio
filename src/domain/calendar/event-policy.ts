import type { CalendarEvent, CalendarEventType } from "./types";
import type { CalendarSettings } from "../print/types";

const PRIORITY: Record<CalendarEventType, number> = {
  roshchodesh: 10,
  major: 20,
  fast: 25,
  state: 30,
  minor: 35,
  special: 45,
  parsha: 60,
  modern: 65,
  custom: 70,
};

export const eventPriority = (type: CalendarEventType): number => PRIORITY[type];

export const isEventVisible = (
  event: CalendarEvent,
  settings: CalendarSettings,
): boolean => {
  switch (event.type) {
    case "major":
      return settings.showMajor;
    case "minor":
      return settings.showMinor;
    case "fast":
      return settings.showFasts;
    case "roshchodesh":
      return settings.showRoshChodesh;
    case "parsha":
      return settings.showParasha;
    case "special":
      return settings.showSpecialShabbat;
    case "state":
      return settings.showStateDays || settings.showAllModern;
    case "modern":
      return settings.showAllModern;
    default:
      return true;
  }
};

export const sortEvents = (events: CalendarEvent[]): CalendarEvent[] =>
  [...events].sort((left, right) => eventPriority(left.type) - eventPriority(right.type));
