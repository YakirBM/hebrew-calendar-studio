import { formatDayMonth, parseIsoDate } from "@/domain/calendar/date-range";
import { isEventVisible, sortEvents } from "@/domain/calendar/event-policy";
import { formatHebrewDate, isHebrewMonthStart } from "@/domain/calendar/hebrew-date";
import type { CalendarDay, PersonalNote } from "@/domain/calendar/types";
import type { CalendarSettings } from "@/domain/print/types";
import { Icon } from "@/components/ui/icon";

type Props = {
  day: CalendarDay;
  settings: CalendarSettings;
  outside: boolean;
  customEvents: string[];
  notes: PersonalNote[];
  onEdit: (date: string) => void;
};

export const DayCell = ({ day, settings, outside, customEvents, notes, onEdit }: Props) => {
  const date = parseIsoDate(day.date);
  const gregorian = date ? formatDayMonth(date) : day.date.slice(5).split("-").reverse().join("/");
  const hebrew = formatHebrewDate(day);
  const events = sortEvents(day.events).filter((event) => isEventVisible(event, settings));
  const hideContent = outside && settings.outsideDays === "blank";
  const dimContent = outside && settings.outsideDays === "dim";

  return (
    <button
      type="button"
      className={`day-cell${dimContent ? " is-outside" : ""}${date?.getDay() === 6 && settings.shadeSaturday ? " is-saturday" : ""}`}
      data-date={day.date}
      onClick={() => onEdit(day.date)}
      aria-label={`${gregorian}, ${hebrew || "תאריך עברי"}. לחיצה לעריכת אזכור`}
    >
      {!hideContent && (
        <span className="day-cell__content">
          <span className="day-cell__date-row">
            <b className={isHebrewMonthStart(day) ? "is-month-start" : ""}>{hebrew}</b>
            <span className={date?.getDate() === 1 ? "is-month-start" : ""} dir="ltr">{gregorian}</span>
          </span>
          <span className="day-cell__events">
            {events.map((event, index) => (
              <b key={`${event.type}-${event.title}-${index}`} className={`calendar-event calendar-event--${event.type}`}>{event.label}</b>
            ))}
            {customEvents.map((event, index) => <b className="calendar-event calendar-event--custom" key={`custom-${index}`}>{event}</b>)}
            {notes.map((note) => (
              <span key={note.id} className="personal-note" style={{ color: note.color, fontWeight: note.bold ? 800 : 600 }}>
                {note.text}
              </span>
            ))}
          </span>
          <span className="day-cell__edit-hint no-print"><Icon name="edit" /></span>
        </span>
      )}
    </button>
  );
};
