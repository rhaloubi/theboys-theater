import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "TBT — The Boys Theater";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#141414",
          fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 160,
            height: 160,
            borderRadius: 24,
            background: "#1a1a1a",
            border: "2px solid #333",
            color: "#e50914",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: -2,
          }}
        >
          TBT
        </div>
        <div
          style={{
            marginTop: 32,
            color: "#ffffff",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          The Boys Theater
        </div>
        <div
          style={{
            marginTop: 12,
            color: "#b3b3b3",
            fontSize: 24,
          }}
        >
          Private streaming hub
        </div>
      </div>
    ),
    { ...size },
  );
}
