import type { Region } from "@/domain/calendar/types";
import type { HebcalResponse } from "./contract";

const HEBCAL_ENDPOINT = "https://www.hebcal.com/hebcal";

export const fetchHebcal = async (
  start: string,
  end: string,
  region: Region,
): Promise<HebcalResponse> => {
  const params = new URLSearchParams({
    v: "1",
    cfg: "json",
    start,
    end,
    maj: "on",
    min: "on",
    mod: "on",
    nx: "on",
    ss: "on",
    mf: "on",
    s: "on",
    leyning: "off",
    d: "on",
    lg: "h",
    hdp: "1",
    i: region === "israel" ? "on" : "off",
  });

  const response = await fetch(`${HEBCAL_ENDPOINT}?${params.toString()}`, {
    next: { revalidate: 86_400 },
    signal: AbortSignal.timeout(15_000),
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Hebcal returned ${response.status}`);
  }

  return (await response.json()) as HebcalResponse;
};
