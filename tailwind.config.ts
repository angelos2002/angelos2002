import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#0a0908", 800: "#121010", 700: "#1a1716", 600: "#24201e" },
        flame: { DEFAULT: "#ff6a1a", 300: "#ffa463", 400: "#ff8a3d", 600: "#e5520a", 700: "#b83f06" },
        cream: { DEFAULT: "#f6ecd9", muted: "#c9bba3", dim: "#8f8370" },
        ember: "#ffb547",
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(255,106,26,0.45), 0 0 64px rgba(255,106,26,0.18)",
        "glow-sm": "0 0 12px rgba(255,106,26,0.5)",
        glass: "inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 40px rgba(0,0,0,0.45)",
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        pulseDot: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.35" } },
      },
      animation: {
        marquee: "marquee 45s linear infinite",
        "pulse-dot": "pulseDot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
