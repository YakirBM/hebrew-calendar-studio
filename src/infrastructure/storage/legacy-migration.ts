import type { NotesByDate, PersonalNote } from "@/domain/calendar/types";
import { loadNotes, saveNotes } from "./notes.repository";

const LEGACY_NOTES_KEY = "seder-yom-notes-v1";
const MIGRATION_KEY = "seder-yom-storage-migrated-v2";

export const migrateLegacyNotes = async (): Promise<void> => {
  if (typeof window === "undefined" || window.localStorage.getItem(MIGRATION_KEY)) {
    return;
  }

  try {
    const existing = await loadNotes();
    const raw = window.localStorage.getItem(LEGACY_NOTES_KEY);
    if (Object.keys(existing).length === 0 && raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const migrated: NotesByDate = {};
      for (const [date, value] of Object.entries(parsed)) {
        const items = Array.isArray(value) ? value : [value];
        migrated[date] = items
          .map((item, index): PersonalNote | null => {
            if (typeof item === "string") {
              return {
                id: `legacy-${date}-${index}`,
                text: item,
                color: "#176b5b",
                bold: false,
              };
            }
            if (!item || typeof item !== "object") return null;
            const note = item as Partial<PersonalNote>;
            if (typeof note.text !== "string") return null;
            return {
              id: note.id ?? `legacy-${date}-${index}`,
              text: note.text,
              color: note.color ?? "#176b5b",
              bold: Boolean(note.bold),
            };
          })
          .filter((note): note is PersonalNote => note !== null);
      }
      await saveNotes(migrated);
    }
  } finally {
    window.localStorage.setItem(MIGRATION_KEY, "1");
  }
};
