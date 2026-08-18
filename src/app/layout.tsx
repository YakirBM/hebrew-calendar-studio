import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "סדר יום — סטודיו ללוח עברי",
  description: "יצירת לוחות עבריים מדויקים ומותאמים אישית להדפסה על A4 או A3.",
  applicationName: "סדר יום",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#173d33",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="he" dir="rtl"><body>{children}</body></html>;
}
