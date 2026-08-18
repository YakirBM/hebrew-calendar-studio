"use client";

import { useEffect, useRef, useState } from "react";
import { parseCustomEvents } from "@/domain/calendar/custom-events";
import type { CalendarSettings, Density, DesignPreset } from "@/domain/print/types";
import { Icon } from "@/components/ui/icon";

type Props = {
  settings: CalendarSettings;
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onUpdate: (patch: Partial<CalendarSettings>) => void;
  onDensity: (density: Exclude<Density, "custom">) => void;
  onPreset: (preset: Exclude<DesignPreset, "custom">) => void;
  onGenerate: () => void;
  onExportProject: () => void;
  onImportProject: (file: File) => void;
  onReset: () => void;
};

const Section = ({ id, title, eyebrow, children, compact, open, onToggle }: {
  id: string;
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  compact: boolean;
  open: boolean;
  onToggle: (id: string) => void;
}) => (
  <section className="settings-section">
    {compact ? (
      <button
        className="settings-section__trigger"
        type="button"
        aria-expanded={open}
        aria-controls={`settings-section-${id}`}
        onClick={() => onToggle(id)}
      >
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        <span className="settings-section__toggle" aria-hidden="true"><Icon name={open ? "minus" : "plus"} /></span>
      </button>
    ) : (
      <header className="settings-section__trigger"><span>{eyebrow}</span><h2>{title}</h2></header>
    )}
    <div className="settings-section__body" id={`settings-section-${id}`} hidden={compact && !open}>{children}</div>
  </section>
);

const Segmented = <T extends string>({ value, options, onChange, label }: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
}) => (
  <div className="segmented" role="radiogroup" aria-label={label}>
    {options.map((option) => (
      <button key={option.value} type="button" role="radio" aria-checked={value === option.value} className={value === option.value ? "is-selected" : ""} onClick={() => onChange(option.value)}>{option.label}</button>
    ))}
  </div>
);

const Toggle = ({ checked, label, hint, onChange }: { checked: boolean; label: string; hint?: string; onChange: (checked: boolean) => void }) => (
  <label className="toggle-row">
    <span><strong>{label}</strong>{hint && <small>{hint}</small>}</span>
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    <span className="toggle-track" aria-hidden="true"><span /></span>
  </label>
);

const RangeField = ({ label, value, min, max, step = 0.25, suffix, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; suffix: string; onChange: (value: number) => void;
}) => (
  <label className="range-field">
    <span><strong>{label}</strong><output>{value}{suffix}</output></span>
    <input type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} />
  </label>
);

const ColorField = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
  <label className="color-field"><span>{label}</span><span><code>{value}</code><input type="color" value={value} onChange={(event) => onChange(event.target.value)} /></span></label>
);

export const SettingsPanel = ({ settings, open, loading, onClose, onUpdate, onDensity, onPreset, onGenerate, onExportProject, onImportProject, onReset }: Props) => {
  const importRef = useRef<HTMLInputElement>(null);
  const customEventErrors = parseCustomEvents(settings.customEvents).errors;
  const [compact, setCompact] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [activeSection, setActiveSection] = useState("layout");

  useEffect(() => {
    const compactQuery = window.matchMedia("(max-width: 680px)");
    const drawerQuery = window.matchMedia("(max-width: 1024px)");
    const sync = () => {
      setCompact(compactQuery.matches);
      setDrawer(drawerQuery.matches);
    };
    sync();
    compactQuery.addEventListener("change", sync);
    drawerQuery.addEventListener("change", sync);
    return () => {
      compactQuery.removeEventListener("change", sync);
      drawerQuery.removeEventListener("change", sync);
    };
  }, []);

  const sectionProps = (id: string) => ({
    id,
    compact,
    open: activeSection === id,
    onToggle: (nextId: string) => setActiveSection((current) => current === nextId ? "" : nextId),
  });

  return (
    <aside className={`settings-panel no-print${open ? " is-open" : ""}`} aria-label="הגדרות הלוח" aria-hidden={drawer && !open || undefined} inert={drawer && !open ? true : undefined}>
      <div className="settings-panel__header">
        <div><span>סטודיו להדפסה</span><h1>הגדרות הלוח</h1></div>
        <button className="icon-button settings-close" type="button" aria-label="סגירת הגדרות" onClick={onClose}><Icon name="close" /></button>
      </div>

      <div className="settings-panel__scroll">
        <Section {...sectionProps("layout")} eyebrow="01" title="טווח ופריסה">
          <div className="field-grid field-grid--dates">
            <label className="field"><span>מתאריך</span><input type="date" value={settings.startDate} onChange={(event) => onUpdate({ startDate: event.target.value })} /></label>
            <label className="field"><span>עד תאריך</span><input type="date" value={settings.endDate} onChange={(event) => onUpdate({ endDate: event.target.value })} /></label>
          </div>
          <label className="field"><span>מנהג</span><select value={settings.region} onChange={(event) => onUpdate({ region: event.target.value as CalendarSettings["region"] })}><option value="israel">ישראל</option><option value="diaspora">חוץ לארץ</option></select></label>
          <div className="control-label">גודל נייר</div>
          <Segmented label="גודל נייר" value={settings.paperSize} options={[{ value: "a4", label: "A4" }, { value: "a3", label: "A3" }]} onChange={(paperSize) => onUpdate({ paperSize })} />
          <div className="control-label">כיוון הדף</div>
          <Segmented label="כיוון הדף" value={settings.orientation} options={[{ value: "portrait", label: "אנכי" }, { value: "landscape", label: "אופקי" }]} onChange={(orientation) => onUpdate({ orientation })} />
          <div className="control-label">חלוקת עמודים</div>
          <Segmented label="חלוקת עמודים" value={settings.paginationMode} options={[{ value: "single", label: "הכול בעמוד אחד" }, { value: "pages", label: "מספר עמודים" }]} onChange={(paginationMode) => onUpdate({ paginationMode })} />
          {settings.paginationMode === "pages" && <RangeField label="שבועות בעמוד" value={settings.weeksPerPage} min={4} max={30} step={1} suffix="" onChange={(weeksPerPage) => onUpdate({ weeksPerPage })} />}
          <label className="field"><span>ימים מחוץ לטווח</span><select value={settings.outsideDays} onChange={(event) => onUpdate({ outsideDays: event.target.value as CalendarSettings["outsideDays"] })}><option value="dim">מוצגים בעמעום</option><option value="blank">תאים ריקים</option><option value="show">מוצגים כרגיל</option></select></label>
        </Section>

        <Section {...sectionProps("content")} eyebrow="02" title="תוכן וסימונים">
          <div className="toggle-list">
            <Toggle checked={settings.showMajor} label="חגים מרכזיים" onChange={(showMajor) => onUpdate({ showMajor })} />
            <Toggle checked={settings.showMinor} label="מועדים נוספים" onChange={(showMinor) => onUpdate({ showMinor })} />
            <Toggle checked={settings.showFasts} label="צומות" onChange={(showFasts) => onUpdate({ showFasts })} />
            <Toggle checked={settings.showRoshChodesh} label="ראשי חודשים" hint="כולל ל׳ וא׳ בשני ימי ראש חודש" onChange={(showRoshChodesh) => onUpdate({ showRoshChodesh })} />
            <Toggle checked={settings.showParasha} label="פרשת השבוע" onChange={(showParasha) => onUpdate({ showParasha })} />
            <Toggle checked={settings.showSpecialShabbat} label="שבתות מיוחדות" onChange={(showSpecialShabbat) => onUpdate({ showSpecialShabbat })} />
            <Toggle checked={settings.showStateDays} label="מועדי מדינת ישראל" hint="שואה, זיכרון ועצמאות" onChange={(showStateDays) => onUpdate({ showStateDays })} />
            <Toggle checked={settings.showAllModern} label="כל המועדים המודרניים" onChange={(showAllModern) => onUpdate({ showAllModern })} />
          </div>
          <label className="field"><span>אירועים חיצוניים / דת אחרת</span><textarea rows={5} dir="ltr" placeholder={"2026-12-25 | Christmas\n2027-01-01 | New Year"} value={settings.customEvents} onChange={(event) => onUpdate({ customEvents: event.target.value })} /></label>
          {customEventErrors.length > 0 && <p className="field-error">יש לתקן את השורות: {customEventErrors.join(", ")}. הפורמט הוא YYYY-MM-DD | טקסט.</p>}
        </Section>

        <Section {...sectionProps("design")} eyebrow="03" title="עיצוב וטיפוגרפיה">
          <div className="control-label">ערכת עיצוב</div>
          <Segmented label="ערכת עיצוב" value={settings.designPreset} options={[{ value: "classic", label: "קלאסי" }, { value: "modern", label: "מודרני" }, { value: "heritage", label: "מורשת" }, ...(settings.designPreset === "custom" ? [{ value: "custom" as const, label: "מותאם" }] : [])]} onChange={(preset) => preset !== "custom" && onPreset(preset)} />
          <div className="control-label">צפיפות</div>
          <Segmented label="צפיפות" value={settings.density} options={[{ value: "comfortable", label: "מרווח" }, { value: "balanced", label: "מאוזן" }, { value: "compact", label: "צפוף" }, ...(settings.density === "custom" ? [{ value: "custom" as const, label: "מותאם" }] : [])]} onChange={(density) => density !== "custom" && onDensity(density)} />
          <label className="field"><span>גופן הלוח</span><select value={settings.calendarFont} onChange={(event) => onUpdate({ calendarFont: event.target.value })}><option value="Noto Sans Hebrew">Noto Sans Hebrew</option><option value="Rubik">Rubik</option><option value="Arial">Arial</option><option value="Noto Serif Hebrew">Noto Serif Hebrew</option></select></label>
          <RangeField label="גודל טקסט" value={settings.bodySize} min={4} max={14} suffix="pt" onChange={(bodySize) => onUpdate({ bodySize })} />
          <RangeField label="כותרות ימים" value={settings.headerSize} min={9} max={28} step={0.5} suffix="pt" onChange={(headerSize) => onUpdate({ headerSize })} />
          <RangeField label="שולי עמוד" value={settings.pageMargin} min={0} max={15} suffix=" מ״מ" onChange={(pageMargin) => onUpdate({ pageMargin })} />
          <RangeField label="גובה כותרת" value={settings.headerHeight} min={5} max={18} suffix=" מ״מ" onChange={(headerHeight) => onUpdate({ headerHeight })} />
          <RangeField label="עובי קווים" value={settings.gridWidth} min={0.5} max={2.5} suffix="px" onChange={(gridWidth) => onUpdate({ gridWidth })} />
          <Toggle checked={settings.shadeSaturday} label="רקע עדין לשבת" onChange={(shadeSaturday) => onUpdate({ shadeSaturday })} />
          <div className="color-list">
            <ColorField label="רקע כותרות" value={settings.headerColor} onChange={(headerColor) => onUpdate({ headerColor })} />
            <ColorField label="קווי הטבלה" value={settings.gridColor} onChange={(gridColor) => onUpdate({ gridColor })} />
            <ColorField label="טקסט רגיל" value={settings.textColor} onChange={(textColor) => onUpdate({ textColor })} />
            <ColorField label="חגים" value={settings.holidayColor} onChange={(holidayColor) => onUpdate({ holidayColor })} />
            <ColorField label="אזכורים אישיים" value={settings.noteColor} onChange={(noteColor) => onUpdate({ noteColor })} />
          </div>
        </Section>

        <Section {...sectionProps("project")} eyebrow="04" title="קובץ פרויקט">
          <p className="section-copy">אפשר לשמור את כל ההגדרות והאזכורים בקובץ מקומי ולהמשיך במחשב אחר.</p>
          <div className="project-actions">
            <button type="button" className="button button--quiet" onClick={onExportProject}><Icon name="download" />שמירת פרויקט</button>
            <button type="button" className="button button--quiet" onClick={() => importRef.current?.click()}><Icon name="upload" />פתיחת פרויקט</button>
            <button type="button" className="button button--danger" onClick={onReset}><Icon name="reset" />איפוס הגדרות</button>
          </div>
          <input ref={importRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={(event) => { const file = event.target.files?.[0]; if (file) onImportProject(file); event.target.value = ""; }} />
        </Section>
      </div>

      <div className="settings-panel__footer">
        <button className="button button--primary button--wide" type="button" onClick={onGenerate} disabled={loading || customEventErrors.length > 0}>
          {loading ? <span className="spinner" /> : <Icon name="calendar" />}
          {loading ? "מפיק לוח…" : "הפקת לוח מעודכן"}
        </button>
      </div>
    </aside>
  );
};
