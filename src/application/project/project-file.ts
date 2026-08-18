import { z } from "zod";
import type { NotesByDate } from "@/domain/calendar/types";
import type { CalendarSettings } from "@/domain/print/types";

const projectSchema = z.object({
  format: z.literal("seder-yom-studio"),
  version: z.literal(2),
  exportedAt: z.string(),
  settings: z.record(z.string(), z.unknown()),
  notes: z.record(z.string(), z.array(z.object({
    id: z.string(),
    text: z.string().max(500),
    color: z.string(),
    bold: z.boolean(),
  }))),
});

export type ProjectFile = {
  format: "seder-yom-studio";
  version: 2;
  exportedAt: string;
  settings: CalendarSettings;
  notes: NotesByDate;
};

export const createProjectFile = (
  settings: CalendarSettings,
  notes: NotesByDate,
): ProjectFile => ({
  format: "seder-yom-studio",
  version: 2,
  exportedAt: new Date().toISOString(),
  settings,
  notes,
});

export const parseProjectFile = (raw: string): ProjectFile => {
  const parsed = projectSchema.parse(JSON.parse(raw));
  return parsed as unknown as ProjectFile;
};
