"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-14 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center border ${
        isDark
          ? "bg-white border-gray-300 justify-end"
          : "bg-gray-800 border-gray-700 justify-start"
      }`}
      aria-label="Toggle dark mode"
    >
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300 ${
          isDark ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        {isDark ? (
          /* Moon Icon */
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          /* Sun Icon */
          <svg className="w-4 h-4 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
          </svg>
        )}
      </div>
    </button>
  );
}