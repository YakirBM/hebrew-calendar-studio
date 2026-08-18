import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<div style={{ width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16, background: "#173d33", color: "#f5c65f", fontSize: 36, fontWeight: 800 }}>ל</div>, size);
}
