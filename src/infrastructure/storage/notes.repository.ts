import { createStore, get, set } from "idb-keyval";
import type { NotesByDate } from "@/domain/calendar/types";

const notesStore = createStore("seder-yom-studio", "personal-notes");
const NOTES_KEY = "notes-v2";

export const loadNotes = async (): Promise<NotesByDate> => {
  if (typeof indexedDB === "undefined") return {};
  try {
    return (await get<NotesByDate>(NOTES_KEY, notesStore)) ?? {};
  } catch {
    return {};
  }
};

export const saveNotes = async (notes: NotesByDate): Promise<void> => {
  if (typeof indexedDB === "undefined") return;
  await set(NOTES_KEY, notes, notesStore);
};
