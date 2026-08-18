import { Icon } from "@/components/ui/icon";

type Props = {
  zoom: number;
  autoFit: boolean;
  pageLabel: string;
  onZoom: (zoom: number) => void;
  onFit: () => void;
};

export const PreviewToolbar = ({ zoom, autoFit, pageLabel, onZoom, onFit }: Props) => (
  <div className="preview-toolbar no-print">
    <div>
      <span className="preview-toolbar__eyebrow">תצוגה מקדימה חיה</span>
      <strong>{pageLabel}</strong>
    </div>
    <div className="zoom-control" aria-label="הגדלת התצוגה">
      <button type="button" aria-label="הקטנה" onClick={() => onZoom(Math.max(0.15, zoom - 0.08))}><Icon name="minus" /></button>
      <output>{Math.round(zoom * 100)}%</output>
      <button type="button" aria-label="הגדלה" onClick={() => onZoom(Math.min(1.2, zoom + 0.08))}><Icon name="plus" /></button>
      <button type="button" className={autoFit ? "is-active" : ""} aria-label="התאמה למסך" onClick={onFit}><Icon name="fit" /></button>
    </div>
  </div>
);
