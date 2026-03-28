import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        cream: "#f8f5ee",
        coral: "#f97316",
        mint: "#10b981",
        ocean: "#0f766e"
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui"],
        body: ["Manrope", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        lift: "0 12px 24px rgba(15, 118, 110, 0.12)"
      }
    }
  },
  plugins: []
} satisfies Config;
