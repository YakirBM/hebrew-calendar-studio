"use client";

import { useMemo, useState } from "react";
import { formatDayMonth, formatIsoDate, parseIsoDate } from "@/domain/calendar/date-range";
import { groupCustomEvents, parseCustomEvents } from "@/domain/calendar/custom-events";
import { isEventVisible, sortEvents } from "@/domain/calendar/event-policy";
import { formatHebrewDate, isHebrewMonthStart } from "@/domain/calendar/hebrew-date";
import type { CalendarDay, CalendarPayload, NotesByDate } from "@/domain/calendar/types";
import type { CalendarSettings } from "@/domain/print/types";
import { Icon } from "@/components/ui/icon";

type Props = {
  payload: CalendarPayload;
  settings: CalendarSettings;
  notes: NotesByDate;
  onEditDay: (date: string) => void;
};

const WEEKDAYS = ["יום ראשון", "יום שני", "יום שלישי", "יום רביעי", "יום חמישי", "יום שישי", "שבת"];
const DAY_FORMATTER = new Intl.DateTimeFormat("he-IL", { day: "numeric" });
const MONTH_FORMATTER = new Intl.DateTimeFormat("he-IL", { month: "long" });
const YEAR_FORMATTER = new Intl.DateTimeFormat("he-IL", { year: "numeric" });

const getWeekLabel = (days: CalendarDay[], index: number): string => {
  const first = parseIsoDate(days[0]?.date ?? "");
  const last = parseIsoDate(days.at(-1)?.date ?? "");
  if (!first || !last) return `שבוע ${index + 1}`;
  const firstDay = DAY_FORMATTER.format(first);
  const lastDay = DAY_FORMATTER.format(last);
  const firstMonth = MONTH_FORMATTER.format(first);
  const lastMonth = MONTH_FORMATTER.format(last);
  const firstYear = YEAR_FORMATTER.format(first);
  const lastYear = YEAR_FORMATTER.format(last);
  if (first.getFullYear() === last.getFullYear() && first.getMonth() === last.getMonth()) {
    return `${firstDay}–${lastDay} ${lastMonth} ${lastYear}`;
  }
  if (first.getFullYear() === last.getFullYear()) {
    return `${firstDay} ${firstMonth} – ${lastDay} ${lastMonth} ${lastYear}`;
  }
  return `${firstDay} ${firstMonth} ${firstYear} – ${lastDay} ${lastMonth} ${lastYear}`;
};

export const MobileWeekCalendar = ({ payload, settings, notes, onEditDay }: Props) => {
  const weeks = useMemo(
    () => Array.from({ length: Math.ceil(payload.days.length / 7) }, (_, index) => payload.days.slice(index * 7, index * 7 + 7)),
    [payload.days],
  );
  const requestedWeek = Math.max(0, Math.floor(Math.max(0, payload.days.findIndex((day) => day.date >= payload.requestedStart)) / 7));
  const [weekIndex, setWeekIndex] = useState(requestedWeek);
  const customEvents = useMemo(
    () => groupCustomEvents(parseCustomEvents(settings.customEvents).events),
    [settings.customEvents],
  );

  const safeWeekIndex = Math.min(weekIndex, Math.max(0, weeks.length - 1));
  const activeWeek = weeks[safeWeekIndex] ?? weeks[0] ?? [];

  return (
    <section className="mobile-week-calendar no-print" aria-label="תצוגת שבוע נגישה למובייל">
      <header className="mobile-week-calendar__header">
        <div>
          <span>תצוגה קריאה</span>
          <h2>{getWeekLabel(activeWeek, safeWeekIndex)}</h2>
        </div>
        <div className="mobile-week-calendar__nav" aria-label="ניווט בין שבועות">
          <button type="button" aria-label="השבוע הקודם" onClick={() => setWeekIndex((value) => Math.max(0, value - 1))} disabled={safeWeekIndex === 0}>
            <Icon name="chevronRight" />
          </button>
          <label>
            <span className="visually-hidden">בחירת שבוע</span>
            <select value={safeWeekIndex} onChange={(event) => setWeekIndex(Number(event.target.value))} aria-label="בחירת שבוע">
              {weeks.map((week, index) => <option value={index} key={week[0]?.date ?? index}>שבוע {index + 1} מתוך {weeks.length}</option>)}
            </select>
          </label>
          <button type="button" aria-label="השבוע הבא" onClick={() => setWeekIndex((value) => Math.min(weeks.length - 1, value + 1))} disabled={safeWeekIndex >= weeks.length - 1}>
            <Icon name="chevronLeft" />
          </button>
        </div>
      </header>

      <p className="mobile-week-calendar__hint">לחיצה על יום פותחת הוספה ועריכה של אזכור אישי.</p>

      <div className="mobile-week-calendar__days">
        {activeWeek.map((day, dayIndex) => {
          const date = parseIsoDate(day.date);
          const outside = day.date < settings.startDate || day.date > settings.endDate;
          const events = sortEvents(day.events).filter((event) => isEventVisible(event, settings));
          const dayNotes = notes[day.date] ?? [];
          const dayCustomEvents = customEvents.get(day.date) ?? [];
          const isToday = date ? day.date === formatIsoDate(new Date()) : false;
          const hideContent = outside && settings.outsideDays === "blank";
          const dimContent = outside && settings.outsideDays === "dim";

          return (
            <button
              className={`mobile-day-card${dimContent ? " is-outside" : ""}${date?.getDay() === 6 ? " is-saturday" : ""}${isToday ? " is-today" : ""}`}
              type="button"
              key={day.date}
              data-mobile-date={day.date}
              onClick={() => onEditDay(day.date)}
              aria-label={`${WEEKDAYS[dayIndex]}, ${date ? formatDayMonth(date) : day.date}, ${formatHebrewDate(day)}. הוספת אזכור`}
            >
              <span className="mobile-day-card__weekday">
                <strong>{WEEKDAYS[dayIndex]}</strong>
                {isToday && <small>היום</small>}
              </span>
              <span className="mobile-day-card__content">
                {hideContent ? <span className="mobile-day-card__empty">מחוץ לטווח · התא יודפס ריק</span> : (
                  <>
                    <span className="mobile-day-card__dates">
                      <b className={isHebrewMonthStart(day) ? "is-month-start" : ""}>{formatHebrewDate(day)}</b>
                      <strong className={date?.getDate() === 1 ? "is-month-start" : ""} dir="ltr">{date ? formatDayMonth(date) : day.date}</strong>
                    </span>
                    {(events.length > 0 || dayCustomEvents.length > 0 || dayNotes.length > 0) ? (
                      <span className="mobile-day-card__events">
                        {events.map((event, index) => <b className={`calendar-event calendar-event--${event.type}`} key={`${event.type}-${event.title}-${index}`}>{event.label}</b>)}
                        {dayCustomEvents.map((event, index) => <b className="calendar-event calendar-event--custom" key={`custom-${index}`}>{event}</b>)}
                        {dayNotes.map((note) => <span className="personal-note" key={note.id} style={{ color: note.color, fontWeight: note.bold ? 800 : 600 }}>{note.text}</span>)}
                      </span>
                    ) : <span className="mobile-day-card__empty">אין סימונים ביום זה</span>}
                  </>
                )}
              </span>
              <span className="mobile-day-card__edit" aria-hidden="true"><Icon name="edit" /></span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
