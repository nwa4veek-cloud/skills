import { ImageResponse } from "next/og";

export const alt = "Phone Match — Less Confusion. Better Choices.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#f7f8f3",
          color: "#1b2b26",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          padding: 72,
          width: "100%",
        }}
      >
        <div style={{ color: "#17684d", fontSize: 28, fontWeight: 700, letterSpacing: 4 }}>
          PHONE MATCH
        </div>
        <div style={{ fontSize: 70, fontWeight: 700, letterSpacing: -3, marginTop: 34 }}>
          Less Confusion.
        </div>
        <div style={{ color: "#17684d", fontSize: 70, fontWeight: 700, letterSpacing: -3 }}>
          Better Choices.
        </div>
        <div style={{ color: "#65756e", fontSize: 28, marginTop: 30 }}>
          Find a phone that fits your budget and needs.
        </div>
      </div>
    ),
    { ...size },
  );
}
