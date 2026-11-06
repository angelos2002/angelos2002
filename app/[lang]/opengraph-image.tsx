import { readFile } from "fs/promises";
import { join } from "path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Street Food Rey — Premium burgers in Limassol";

export default async function OG() {
  const logo = `data:image/png;base64,${(await readFile(join(process.cwd(), "public/logo.png"))).toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 60,
          padding: 72,
          backgroundColor: "#ffffff",
          backgroundImage: "radial-gradient(circle at 85% 15%, rgba(0,225,236,0.35), rgba(255,255,255,0) 55%)",
          color: "#111111",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={420} height={300} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, fontWeight: 900, lineHeight: 0.95, textTransform: "uppercase", letterSpacing: -2 }}>Premium</div>
          <div style={{ fontSize: 92, fontWeight: 900, lineHeight: 0.95, textTransform: "uppercase", letterSpacing: -2 }}>burgers.</div>
          <div style={{ marginTop: 18, fontSize: 34, color: "#00838d", fontWeight: 700 }}>Limassol, Cyprus</div>
          <div style={{ marginTop: 10, fontSize: 26, color: "#3f4650" }}>Zakaki · Leontiou · Guaba Beach</div>
        </div>
      </div>
    ),
    size,
  );
}
