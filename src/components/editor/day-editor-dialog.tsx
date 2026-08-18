"use client";

import { useEffect, useRef, useState } from "react";
import type { PersonalNote } from "@/domain/calendar/types";
import { Icon } from "@/components/ui/icon";

type Props = {
  date: string | null;
  notes: PersonalNote[];
  defaultColor: string;
  onClose: () => void;
  onSave: (note: PersonalNote) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

const blankNote = (color: string): PersonalNote => ({ id: "", text: "", color, bold: false });

export const DayEditorDialog = ({ date, notes, defaultColor, onClose, onSave, onDelete }: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<PersonalNote>(blankNote(defaultColor));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (date && dialog && !dialog.open) {
      setDraft(blankNote(defaultColor));
      dialog.showModal();
    } else if (!date && dialog?.open) {
      dialog.close();
    }
  }, [date, defaultColor]);

  const close = () => {
    dialogRef.current?.close();
    onClose();
  };

  const submit = async () => {
    const text = draft.text.trim();
    if (!text || !date) return;
    await onSave({ ...draft, id: draft.id || crypto.randomUUID(), text });
    setDraft(blankNote(defaultColor));
  };

  return (
    <dialog className="day-dialog no-print" ref={dialogRef} onCancel={(event) => { event.preventDefault(); close(); }} onClose={onClose}>
      <div className="day-dialog__header">
        <div><span>אזכורים אישיים</span><h2>{date ? new Intl.DateTimeFormat("he-IL", { dateStyle: "full" }).format(new Date(`${date}T12:00:00`)) : ""}</h2></div>
        <button type="button" className="icon-button" aria-label="סגירה" onClick={close}><Icon name="close" /></button>
      </div>
      <div className="day-dialog__body">
        {notes.length > 0 && <div className="existing-notes"><h3>אזכורים ביום זה</h3>{notes.map((note) => (
          <div className="note-list-item" key={note.id}>
            <button className="note-list-item__text" type="button" onClick={() => setDraft(note)} style={{ color: note.color, fontWeight: note.bold ? 800 : 600 }}>{note.text}</button>
            <button className="note-list-item__delete" type="button" onClick={() => void onDelete(note.id)}>מחיקה</button>
          </div>
        ))}</div>}
        <label className="field"><span>{draft.id ? "עריכת אזכור" : "אזכור חדש"}</span><textarea autoFocus maxLength={500} rows={4} placeholder="למשל: יום הולדת לאבא" value={draft.text} onChange={(event) => setDraft({ ...draft, text: event.target.value })} /></label>
        <div className="note-options">
          <label className="color-field"><span>צבע</span><input type="color" value={draft.color} onChange={(event) => setDraft({ ...draft, color: event.target.value })} /></label>
          <label className="check-field"><input type="checkbox" checked={draft.bold} onChange={(event) => setDraft({ ...draft, bold: event.target.checked })} /><span>טקסט מודגש</span></label>
        </div>
      </div>
      <div className="day-dialog__footer">
        <button type="button" className="button button--quiet" onClick={close}>ביטול</button>
        <button type="button" className="button button--primary" disabled={!draft.text.trim()} onClick={() => void submit()}><Icon name="check" />{draft.id ? "שמירת שינויים" : "הוספת אזכור"}</button>
      </div>
    </dialog>
  );
};
