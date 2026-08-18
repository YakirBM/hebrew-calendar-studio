import type { DataStatus } from "@/state/calendar-store";
import { ConnectionStatus } from "./connection-status";
import { Icon } from "@/components/ui/icon";

type Props = {
  status: DataStatus;
  onOpenSettings: () => void;
  onPrint: () => void;
  canPrint: boolean;
};

export const TopBar = ({ status, onOpenSettings, onPrint, canPrint }: Props) => (
  <header className="top-bar no-print">
    <div className="brand-lockup">
      <span className="brand-mark"><Icon name="calendar" /></span>
      <span>
        <strong>סדר יום</strong>
        <small>סטודיו ללוח עברי מדויק</small>
      </span>
    </div>
    <div className="top-bar__actions">
      <ConnectionStatus status={status} />
      <button className="button button--quiet settings-trigger" type="button" aria-label="הגדרות" onClick={onOpenSettings}>
        <Icon name="settings" />
        <span>הגדרות</span>
      </button>
      <button className="button button--primary" type="button" aria-label="ייצוא PDF" onClick={onPrint} disabled={!canPrint} title={canPrint ? "פתיחת חלון ההדפסה" : "יש להפיק לוח תקין לפני ההדפסה"}>
        <Icon name="print" />
        <span>ייצוא PDF</span>
      </button>
    </div>
  </header>
);
