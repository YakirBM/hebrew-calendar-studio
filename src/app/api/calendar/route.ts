import { NextRequest } from "next/server";
import { z } from "zod";
import {
  alignRange,
  formatIsoDate,
  validateRange,
} from "@/domain/calendar/date-range";
import type { CalendarPayload } from "@/domain/calendar/types";
import { fetchHebcal } from "@/infrastructure/hebcal/fetch-calendar";
import { normalizeCalendarItems } from "@/infrastructure/hebcal/normalize-calendar";

const querySchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  region: z.enum(["israel", "diaspora"]),
});

export const GET = async (request: NextRequest): Promise<Response> => {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return Response.json(
      { code: "INVALID_QUERY", message: "פרטי הבקשה אינם תקינים." },
      { status: 400 },
    );
  }

  const validation = validateRange(parsed.data.start, parsed.data.end);
  if (!validation.ok) {
    return Response.json(
      { code: "INVALID_RANGE", message: validation.message },
      { status: 400 },
    );
  }

  const aligned = alignRange(validation.range);
  const alignedStart = formatIsoDate(aligned.start);
  const alignedEnd = formatIsoDate(aligned.end);

  try {
    const upstream = await fetchHebcal(alignedStart, alignedEnd, parsed.data.region);
    const items = Array.isArray(upstream.items) ? upstream.items : [];
    const days = normalizeCalendarItems(items);
    if (!days.some((day) => day.hebrew)) {
      throw new Error("Hebcal response omitted daily Hebrew dates");
    }

    const payload: CalendarPayload = {
      source: "Hebcal",
      verifiedAt: new Date().toISOString(),
      requestedStart: parsed.data.start,
      requestedEnd: parsed.data.end,
      alignedStart,
      alignedEnd,
      region: parsed.data.region,
      days,
    };

    return Response.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Hebcal calendar request failed", error);
    return Response.json(
      { code: "UPSTREAM_UNAVAILABLE", message: "מקור נתוני הלוח אינו זמין כעת." },
      { status: 502 },
    );
  }
};
