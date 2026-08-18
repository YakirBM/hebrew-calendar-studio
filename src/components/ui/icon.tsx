import type { SVGProps } from "react";

export type IconName =
  | "calendar"
  | "settings"
  | "print"
  | "wifi"
  | "offline"
  | "plus"
  | "minus"
  | "fit"
  | "close"
  | "edit"
  | "download"
  | "upload"
  | "reset"
  | "check";

const paths: Record<IconName, React.ReactNode> = {
  calendar: <><path d="M6 2v3M18 2v3M3 9h18"/><rect x="3" y="4" width="18" height="17" rx="2"/><path d="m8 14 2 2 5-5"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1V21H9.6v-.09a1.7 1.7 0 0 0-1.1-1.51 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1-.4H3V9.6h.09A1.7 1.7 0 0 0 4.6 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1V3h4v.09a1.7 1.7 0 0 0 1.1 1.51 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.15.38.37.72.66 1 .29.28.64.5 1.03.6H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z"/></>,
  print: <><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>,
  wifi: <><path d="M5 12.6a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="20" r="1"/></>,
  offline: <><path d="m3 3 18 18M8.5 16a5 5 0 0 1 3.5-1.45M5 12.6a10 10 0 0 1 2.25-1.56M12.2 8a10 10 0 0 1 6.8 4.6"/><circle cx="12" cy="20" r="1"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  minus: <path d="M5 12h14"/>,
  fit: <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
  download: <><path d="M12 3v12m-4-4 4 4 4-4"/><path d="M5 21h14"/></>,
  upload: <><path d="M12 21V9m-4 4 4-4 4 4"/><path d="M5 3h14"/></>,
  reset: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
};

export const Icon = ({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    {paths[name]}
  </svg>
);
