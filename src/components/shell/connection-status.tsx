"use client";

import { useEffect, useState } from "react";
import type { DataStatus } from "@/state/calendar-store";
import { Icon } from "@/components/ui/icon";

export const ConnectionStatus = ({ status }: { status: DataStatus }) => {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  const connected = online;
  const label = connected
    ? status === "online"
      ? "מחובר לרשת · נתונים אומתו"
      : status === "error"
        ? "מחובר לרשת · מקור הנתונים לא זמין"
        : "מחובר לרשת"
    : status === "cached" ? "לא מקוון · עותק מקומי" : "אין חיבור לרשת";

  return (
    <span className={`connection-status ${connected ? "is-online" : "is-offline"}`} role="status" aria-live="polite">
      <span className="connection-status__dot" />
      <Icon name={connected ? "wifi" : "offline"} />
      <span>{label}</span>
    </span>
  );
};
