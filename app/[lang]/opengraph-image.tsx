import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Street Food Rey — Premium burgers in Limassol";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#0a0908",
          backgroundImage: "radial-gradient(circle at 85% 20%, rgba(255,106,26,0.45), rgba(10,9,8,0) 55%)",
          color: "#f6ecd9",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: "#ff6a1a", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 60px rgba(255,106,26,0.6)" }}>
            <svg width="44" height="44" viewBox="0 0 24 24"><path fill="#0a0908" d="M12 2.5c1.1 3.8 5.5 6 5.5 11a5.5 5.5 0 0 1-11 0c0-2.2 1.1-3.9 2.2-5 0 1.7.9 2.8 2.2 3.3 0-3.3 0-6 1.1-9.3z" /></svg>
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1, textTransform: "uppercase", display: "flex" }}>
            Street Food&nbsp;<span style={{ color: "#ff6a1a" }}>Rey</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 112, fontWeight: 900, lineHeight: 0.92, textTransform: "uppercase", letterSpacing: -3 }}>Premium burgers.</div>
          <div style={{ fontSize: 112, fontWeight: 900, lineHeight: 0.92, textTransform: "uppercase", letterSpacing: -3, color: "#ff6a1a" }}>Limassol.</div>
        </div>
        <div style={{ fontSize: 30, color: "#c9bba3" }}>Limassol, Cyprus · Zakaki · Leontiou · Guaba Beach</div>
      </div>
    ),
    size,
  );
}
