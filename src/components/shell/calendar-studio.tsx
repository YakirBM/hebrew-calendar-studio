"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCalendarController } from "@/application/calendar/use-calendar-controller";
import { createProjectFile, parseProjectFile } from "@/application/project/project-file";
import { getPaperDimensions } from "@/domain/print/paper";
import { saveNotes } from "@/infrastructure/storage/notes.repository";
import { useCalendarStore } from "@/state/calendar-store";
import { useSettingsStore } from "@/state/settings-store";
import { CalendarPreview } from "@/components/calendar/calendar-preview";
import { DayEditorDialog } from "@/components/editor/day-editor-dialog";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { TopBar } from "./top-bar";
import { PreviewToolbar } from "./preview-toolbar";

export const CalendarStudio = () => {
  const { generate, upsertNote, removeNote, hydrated, status } = useCalendarController();
  const settings = useSettingsStore((state) => state.settings);
  const update = useSettingsStore((state) => state.update);
  const chooseDensity = useSettingsStore((state) => state.chooseDensity);
  const choosePreset = useSettingsStore((state) => state.choosePreset);
  const replaceSettings = useSettingsStore((state) => state.replace);
  const reset = useSettingsStore((state) => state.reset);
  const payload = useCalendarStore((state) => state.payload);
  const notes = useCalendarStore((state) => state.notes);
  const notice = useCalendarStore((state) => state.notice);
  const layoutReady = useCalendarStore((state) => state.layoutReady);
  const overflowingDates = useCalendarStore((state) => state.overflowingDates);
  const setNotes = useCalendarStore((state) => state.setNotes);
  const setStatus = useCalendarStore((state) => state.setStatus);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.6);
  const [autoFit, setAutoFit] = useState(true);
  const generatedOnce = useRef(false);

  useEffect(() => {
    if (hydrated && !generatedOnce.current) {
      generatedOnce.current = true;
      void generate();
    }
  }, [generate, hydrated]);

  useEffect(() => {
    document.body.classList.toggle("drawer-open", settingsOpen);
    return () => document.body.classList.remove("drawer-open");
  }, [settingsOpen]);

  const setManualZoom = (value: number) => {
    setAutoFit(false);
    setZoom(value);
  };
  const fitPreview = () => setAutoFit(true);
  const acceptFitZoom = useCallback((value: number) => setZoom(value), []);

  const print = () => {
    if (!payload || !layoutReady) {
      setStatus("error", overflowingDates.length
        ? `לא ניתן לייצא: הטקסט אינו נכנס בתאים של ${overflowingDates.length} תאריכים. יש להפחית תוכן, להגדיל נייר או לבחור מספר עמודים.`
        : "יש להמתין לסיום בניית התצוגה לפני הייצוא.");
      return;
    }
    window.print();
  };

  const exportProject = () => {
    const blob = new Blob([JSON.stringify(createProjectFile(settings, notes), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `seder-yom-${settings.startDate}-${settings.endDate}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importProject = async (file: File) => {
    try {
      const project = parseProjectFile(await file.text());
      replaceSettings(project.settings);
      setNotes(project.notes);
      await saveNotes(project.notes);
      setStatus("idle", "הפרויקט נטען. לחצו על הפקת לוח כדי לרענן את התאריכים.");
    } catch {
      setStatus("error", "קובץ הפרויקט אינו תקין או שאינו נתמך.");
    }
  };

  const paper = getPaperDimensions(settings.paperSize, settings.orientation);
  const dataStale = Boolean(payload && (
    payload.requestedStart !== settings.startDate ||
    payload.requestedEnd !== settings.endDate ||
    payload.region !== settings.region
  ));

  if (!hydrated) return <div className="app-loading" role="status"><span className="spinner" /><span>מכין את הסטודיו…</span></div>;

  return (
    <div className="studio-root" dir="rtl">
      <style>{`@page { size: ${paper.width}mm ${paper.height}mm; margin: 0; }`}</style>
      <TopBar status={status} onOpenSettings={() => setSettingsOpen(true)} onPrint={print} canPrint={Boolean(payload && layoutReady && !dataStale)} />
      <div className="studio-layout">
        <SettingsPanel settings={settings} open={settingsOpen} loading={status === "loading"} onClose={() => setSettingsOpen(false)} onUpdate={update} onDensity={chooseDensity} onPreset={choosePreset} onGenerate={() => void generate()} onExportProject={exportProject} onImportProject={(file) => void importProject(file)} onReset={reset} />
        <button className={`drawer-backdrop no-print${settingsOpen ? " is-open" : ""}`} type="button" aria-label="סגירת ההגדרות" onClick={() => setSettingsOpen(false)} />
        <main className="preview-workspace">
          <PreviewToolbar zoom={zoom} autoFit={autoFit} pageLabel={`${paper.label}${payload ? ` · ${payload.days.length / 7} שבועות` : ""}`} onZoom={setManualZoom} onFit={fitPreview} />
          <div className={`notice-bar no-print notice-bar--${status}`} role="status" aria-live="polite">
            <span>{dataStale ? "הטווח או המנהג השתנו — יש להפיק לוח מעודכן." : notice}</span>
            {overflowingDates.length > 0 && <strong>נמצאה גלישת טקסט ב־{overflowingDates.length} תאים; הייצוא חסום כדי למנוע קיטוע.</strong>}
          </div>
          {payload ? (
            <CalendarPreview payload={payload} settings={settings} notes={notes} zoom={zoom} autoFit={autoFit} onFitZoom={acceptFitZoom} onEditDay={setSelectedDate} />
          ) : (
            <div className="empty-preview"><span>הדף יופיע כאן</span><h2>מפיקים לוח עברי מדויק להדפסה</h2><p>בחרו טווח, גודל נייר והעדפות תוכן. התצוגה תתאים את כל התאים באופן שווה.</p><button className="button button--primary" type="button" onClick={() => void generate()}>הפקת לוח ראשון</button></div>
          )}
        </main>
      </div>
      <DayEditorDialog date={selectedDate} notes={selectedDate ? notes[selectedDate] ?? [] : []} defaultColor={settings.noteColor} onClose={() => setSelectedDate(null)} onSave={async (note) => { if (selectedDate) await upsertNote(selectedDate, note); }} onDelete={async (id) => { if (selectedDate) await removeNote(selectedDate, id); }} />
    </div>
  );
};
