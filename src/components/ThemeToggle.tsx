import { useEffect, useState } from "react";
import { cn } from "../lib/utils";

export function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <button
      className={cn(
        "rounded-full border border-violet-400/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-black shadow-glow backdrop-blur-xl transition hover:bg-violet-400/20 hover:text-black",
        "focus:outline-none focus:ring-2 focus:ring-violet-400",
      )}
      aria-label="Toggle light/dark mode"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
