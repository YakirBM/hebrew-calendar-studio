import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "סדר יום — סטודיו ללוח עברי",
    short_name: "סדר יום",
    description: "יצירת לוחות עבריים מדויקים להדפסה",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f0e8",
    theme_color: "#173d33",
    lang: "he",
    dir: "rtl",
  };
}
