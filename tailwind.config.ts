import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#f3f4f6",
        cream: "#000000",
        coral: "#f973ff",
        mint: "#a855f7",
        ocean: "#7c3aed"
      },
      fontFamily: {
        display: ["Sora", "ui-sans-serif", "system-ui"],
        body: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        lift: "0 18px 40px rgba(0, 0, 0, 0.45)",
        glow: "0 0 0 1px rgba(168,85,247,0.34), 0 10px 30px rgba(124,58,237,0.38)"
      },
      backgroundImage: {
        "ai-grid": "linear-gradient(rgba(124,58,237,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.1) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
} satisfies Config;
