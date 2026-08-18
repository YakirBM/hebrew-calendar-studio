import type { HebrewDateParts } from "@/domain/calendar/types";

export type HebcalItem = {
  title?: string;
  title_orig?: string;
  date?: string;
  hdate?: string;
  hebrew?: string;
  category?: string;
  subcat?: string;
  heDateParts?: HebrewDateParts;
};

export type HebcalResponse = {
  title?: string;
  date?: string;
  location?: unknown;
  items?: HebcalItem[];
};
