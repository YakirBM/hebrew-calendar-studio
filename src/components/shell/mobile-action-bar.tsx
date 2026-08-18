import { Icon } from "@/components/ui/icon";

export type MobileViewMode = "week" | "page";

type Props = {
  viewMode: MobileViewMode;
  canPrint: boolean;
  onViewMode: (mode: MobileViewMode) => void;
  onOpenSettings: () => void;
  onPrint: () => void;
};

export const MobileActionBar = ({ viewMode, canPrint, onViewMode, onOpenSettings, onPrint }: Props) => (
  <nav className="mobile-action-bar no-print" aria-label="פעולות ראשיות">
    <button type="button" onClick={onOpenSettings} aria-label="פתיחת הגדרות">
      <Icon name="settings" />
      <span>הגדרות</span>
    </button>
    <button type="button" className={viewMode === "week" ? "is-active" : ""} aria-pressed={viewMode === "week"} onClick={() => onViewMode("week")}>
      <Icon name="calendar" />
      <span>שבוע קריא</span>
    </button>
    <button type="button" className={viewMode === "page" ? "is-active" : ""} aria-pressed={viewMode === "page"} onClick={() => onViewMode("page")}>
      <Icon name="fit" />
      <span>דף מלא</span>
    </button>
    <button type="button" className="mobile-action-bar__print" onClick={onPrint} disabled={!canPrint} aria-label="ייצוא PDF" title={canPrint ? "פתיחת חלון ההדפסה" : "יש להפיק לוח תקין לפני ההדפסה"}>
      <Icon name="print" />
      <span>PDF</span>
    </button>
  </nav>
);
