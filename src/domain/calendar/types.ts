export type Region = "israel" | "diaspora";

export type CalendarEventType =
  | "major"
  | "minor"
  | "fast"
  | "roshchodesh"
  | "parsha"
  | "special"
  | "state"
  | "modern"
  | "custom";

export type HebrewDateParts = {
  d?: string;
  m?: string;
  y?: string;
};

export type CalendarEvent = {
  type: CalendarEventType;
  label: string;
  title: string;
  category: string;
};

export type CalendarDay = {
  date: string;
  hebrew: string;
  heDateParts: HebrewDateParts | null;
  events: CalendarEvent[];
};

export type CalendarPayload = {
  source: "Hebcal";
  verifiedAt: string;
  requestedStart: string;
  requestedEnd: string;
  alignedStart: string;
  alignedEnd: string;
  region: Region;
  days: CalendarDay[];
};

export type PersonalNote = {
  id: string;
  text: string;
  color: string;
  bold: boolean;
};

export type NotesByDate = Record<string, PersonalNote[]>;

export type CustomEvent = {
  date: string;
  label: string;
};
