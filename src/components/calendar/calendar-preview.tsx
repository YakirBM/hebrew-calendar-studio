"use client";

import { useEffect, useMemo, useRef } from "react";
import { getTotalWeeks, parseIsoDate } from "@/domain/calendar/date-range";
import { groupCustomEvents, parseCustomEvents } from "@/domain/calendar/custom-events";
import type { CalendarPayload, NotesByDate } from "@/domain/calendar/types";
import { createLayoutPlan, MIN_AUTO_FONT_PT } from "@/domain/print/layout-engine";
import type { CalendarSettings } from "@/domain/print/types";
import { useCalendarStore } from "@/state/calendar-store";
import { CalendarPage } from "./calendar-page";

type Props = {
  payload: CalendarPayload;
  settings: CalendarSettings;
  notes: NotesByDate;
  zoom: number;
  autoFit: boolean;
  onFitZoom: (zoom: number) => void;
  onEditDay: (date: string) => void;
};

const MM_TO_PX = 96 / 25.4;

export const CalendarPreview = ({ payload, settings, notes, zoom, autoFit, onFitZoom, onEditDay }: Props) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const setLayoutResult = useCalendarStore((state) => state.setLayoutResult);

  const plan = useMemo(() => {
    const start = parseIsoDate(payload.alignedStart);
    const end = parseIsoDate(payload.alignedEnd);
    return createLayoutPlan(start && end ? getTotalWeeks(start, end) : 1, settings);
  }, [payload.alignedEnd, payload.alignedStart, settings]);

  const pages = useMemo(() => {
    const count = plan.rowsPerPage * 7;
    return Array.from({ length: plan.pageCount }, (_, index) =>
      payload.days.slice(index * count, (index + 1) * count),
    );
  }, [payload.days, plan.pageCount, plan.rowsPerPage]);

  const customEvents = useMemo(
    () => groupCustomEvents(parseCustomEvents(settings.customEvents).events),
    [settings.customEvents],
  );

  useEffect(() => {
    if (!autoFit || !canvasRef.current) return;
    const element = canvasRef.current;
    const update = () => {
      const available = Math.max(180, element.clientWidth - 48);
      const paperWidth = plan.paper.width * MM_TO_PX;
      onFitZoom(Math.min(1, Math.max(0.15, available / paperWidth)));
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    update();
    return () => observer.disconnect();
  }, [autoFit, onFitZoom, plan.paper.width]);

  useEffect(() => {
    let cancelled = false;
    const fit = async () => {
      await document.fonts?.ready;
      if (cancelled || !pagesRef.current) return;
      const overflows: string[] = [];
      const contents = pagesRef.current.querySelectorAll<HTMLElement>(".day-cell__content");
      contents.forEach((content) => {
        let size = plan.sizing.bodySize;
        content.style.fontSize = `${size}pt`;
        while (
          (content.scrollHeight > content.clientHeight + 1 || content.scrollWidth > content.clientWidth + 1) &&
          size > MIN_AUTO_FONT_PT
        ) {
          size = Math.max(MIN_AUTO_FONT_PT, size - 0.25);
          content.style.fontSize = `${size}pt`;
        }
        const overflow = content.scrollHeight > content.clientHeight + 1 || content.scrollWidth > content.clientWidth + 1;
        const cell = content.closest<HTMLElement>("[data-date]");
        cell?.classList.toggle("has-overflow", overflow);
        if (overflow && cell?.dataset.date) overflows.push(cell.dataset.date);
      });
      setLayoutResult(overflows.length === 0, overflows);
    };
    const frame = requestAnimationFrame(() => void fit());
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [notes, pages, plan.sizing.bodySize, setLayoutResult, settings]);

  const frameWidth = plan.paper.width * MM_TO_PX * zoom;
  const frameHeight = plan.paper.height * MM_TO_PX * zoom;

  return (
    <div className="preview-canvas" ref={canvasRef}>
      <div className="print-pages" ref={pagesRef} style={{ "--paper-width": `${plan.paper.width}mm`, "--paper-height": `${plan.paper.height}mm` } as React.CSSProperties}>
        {pages.map((days, pageIndex) => (
          <div className="preview-page-frame" key={pageIndex} style={{ width: frameWidth, height: frameHeight }}>
            <div className="preview-page-scale" style={{ transform: `scale(${zoom})` }}>
              <CalendarPage days={days} pageIndex={pageIndex} settings={settings} plan={plan} notes={notes} customEvents={customEvents} onEditDay={onEditDay} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
