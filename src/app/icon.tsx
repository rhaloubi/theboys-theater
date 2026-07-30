import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#141414",
          borderRadius: 6,
          color: "#e50914",
          fontSize: 13,
          fontWeight: 800,
          fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
          letterSpacing: -0.5,
        }}
      >
        TBT
      </div>
    ),
    { ...size },
  );
}
