"use client";

import { create } from "zustand";
import type { CalendarPayload, NotesByDate } from "@/domain/calendar/types";

export type DataStatus = "idle" | "loading" | "online" | "cached" | "error";

type CalendarState = {
  status: DataStatus;
  payload: CalendarPayload | null;
  notes: NotesByDate;
  notice: string;
  layoutReady: boolean;
  overflowingDates: string[];
  setStatus: (status: DataStatus, notice?: string) => void;
  setPayload: (payload: CalendarPayload | null) => void;
  setNotes: (notes: NotesByDate) => void;
  setLayoutResult: (ready: boolean, overflowingDates?: string[]) => void;
};

export const useCalendarStore = create<CalendarState>((set) => ({
  status: "idle",
  payload: null,
  notes: {},
  notice: "בחרו טווח תאריכים והפיקו לוח מדויק.",
  layoutReady: false,
  overflowingDates: [],
  setStatus: (status, notice) =>
    set((state) => ({ status, notice: notice ?? state.notice })),
  setPayload: (payload) => set({ payload, layoutReady: false, overflowingDates: [] }),
  setNotes: (notes) => set({ notes, layoutReady: false }),
  setLayoutResult: (layoutReady, overflowingDates = []) =>
    set({ layoutReady, overflowingDates }),
}));
