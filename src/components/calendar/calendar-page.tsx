import type { CalendarDay, NotesByDate } from "@/domain/calendar/types";
import type { CalendarSettings, LayoutPlan } from "@/domain/print/types";
import { DayCell } from "./day-cell";

const WEEKDAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

type Props = {
  days: CalendarDay[];
  pageIndex: number;
  settings: CalendarSettings;
  plan: LayoutPlan;
  notes: NotesByDate;
  customEvents: Map<string, string[]>;
  onEditDay: (date: string) => void;
};

export const CalendarPage = ({ days, pageIndex, settings, plan, notes, customEvents, onEditDay }: Props) => (
  <section
    className="calendar-paper"
    data-page={pageIndex + 1}
    style={{
      width: `${plan.paper.width}mm`,
      height: `${plan.paper.height}mm`,
      padding: `${settings.pageMargin}mm`,
      color: settings.textColor,
      fontFamily: settings.calendarFont,
      "--grid-color": settings.gridColor,
      "--grid-width": `${settings.gridWidth}px`,
      "--header-color": settings.headerColor,
      "--holiday-color": settings.holidayColor,
      "--note-color": settings.noteColor,
      "--cell-pad-y": `${plan.sizing.cellPadding}mm`,
      "--cell-pad-x": `${plan.sizing.cellPaddingX}mm`,
      "--body-size": `${plan.sizing.bodySize}pt`,
      "--header-size": `${plan.sizing.headerSize}pt`,
    } as React.CSSProperties}
  >
    <div
      className="calendar-grid"
      style={{ gridTemplateRows: `${settings.headerHeight}mm repeat(${plan.rowsPerPage}, minmax(0, 1fr))` }}
    >
      {WEEKDAYS.map((weekday) => <div className="weekday-header" key={weekday}>{weekday}</div>)}
      {days.map((day) => (
        <DayCell
          key={day.date}
          day={day}
          settings={settings}
          outside={day.date < settings.startDate || day.date > settings.endDate}
          customEvents={customEvents.get(day.date) ?? []}
          notes={notes[day.date] ?? []}
          onEdit={onEditDay}
        />
      ))}
      {Array.from({ length: Math.max(0, plan.rowsPerPage * 7 - days.length) }, (_, index) => (
        <span className="day-cell is-empty" aria-hidden="true" key={`empty-${index}`} />
      ))}
    </div>
    <span className="page-number no-screen">{pageIndex + 1}</span>
  </section>
);
