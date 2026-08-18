import {
  addDays as addCalendarDays,
  differenceInCalendarDays,
} from "date-fns";

export const MAX_RANGE_DAYS = 1_096;

export type ValidatedRange = {
  start: Date;
  end: Date;
};

export type RangeValidation =
  | { ok: true; range: ValidatedRange }
  | { ok: false; message: string };

export const parseIsoDate = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

export const formatIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const addDays = (date: Date, days: number): Date =>
  addCalendarDays(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12), days);

export const diffDays = (start: Date, end: Date): number =>
  differenceInCalendarDays(end, start);

export const validateRange = (startValue: string, endValue: string): RangeValidation => {
  if (!startValue || !endValue) {
    return { ok: false, message: "יש להזין תאריך התחלה ותאריך סיום." };
  }

  const start = parseIsoDate(startValue);
  const end = parseIsoDate(endValue);
  if (!start || !end) {
    return { ok: false, message: "אחד התאריכים אינו תקין." };
  }
  if (start > end) {
    return { ok: false, message: "תאריך הסיום חייב להיות מאוחר מתאריך ההתחלה." };
  }
  if (diffDays(start, end) + 1 > MAX_RANGE_DAYS) {
    return { ok: false, message: "ניתן ליצור לוח לטווח מרבי של שלוש שנים." };
  }

  return { ok: true, range: { start, end } };
};

export const alignRange = ({ start, end }: ValidatedRange): ValidatedRange => ({
  start: addDays(start, -start.getDay()),
  end: addDays(end, 6 - end.getDay()),
});

export const getTotalWeeks = (start: Date, end: Date): number =>
  Math.ceil((diffDays(start, end) + 1) / 7);

export const formatDayMonth = (date: Date): string =>
  `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;

export const formatDayMonthYear = (date: Date): string =>
  `${formatDayMonth(date)}/${date.getFullYear()}`;

export const createDefaultDateRange = (today = new Date()): { startDate: string; endDate: string } => {
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  const sunday = addDays(localToday, -localToday.getDay());
  return {
    startDate: formatIsoDate(sunday),
    endDate: formatIsoDate(addDays(sunday, 153)),
  };
};
