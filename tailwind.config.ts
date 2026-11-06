import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#ffffff", 800: "#f5f7f8", 700: "#eef1f3", 600: "#e3e7ea" },
        flame: { DEFAULT: "#00e1ec", 300: "#8af5fa", 400: "#3ff0f7", 600: "#00b8c3", 700: "#008b94" },
        onaccent: "#000000",
        orange: { DEFAULT: "#ff6a13", 600: "#e85a05" },
        cream: { DEFAULT: "#111111", muted: "#3f4650", dim: "#6b7280" },
        ember: "#d98e00",
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 22px rgba(0,225,236,0.45), 0 0 60px rgba(0,225,236,0.18)",
        "glow-sm": "0 0 12px rgba(0,225,236,0.5)",
        glass: "0 1px 2px rgba(0,0,0,0.04), 0 8px 30px rgba(0,0,0,0.06)",
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
