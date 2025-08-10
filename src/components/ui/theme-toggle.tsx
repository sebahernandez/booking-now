"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted transition-colors">
        <div className="h-4 w-4 rounded-full bg-background shadow-sm transition-transform" />
      </div>
    );
  }

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-background",
        isDark 
          ? "bg-blue-600 shadow-lg" 
          : "bg-gray-200 shadow-inner"
      )}
      role="switch"
      aria-checked={isDark}
      aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
    >
      {/* Toggle circle */}
      <div
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 ease-in-out transform",
          isDark 
            ? "translate-x-5" 
            : "translate-x-0.5"
        )}
      >
        {/* Icons */}
        <Sun 
          className={cn(
            "h-3 w-3 text-amber-500 transition-all duration-300",
            isDark 
              ? "opacity-0 scale-0 rotate-90" 
              : "opacity-100 scale-100 rotate-0"
          )} 
        />
        <Moon 
          className={cn(
            "absolute h-3 w-3 text-slate-700 transition-all duration-300",
            isDark 
              ? "opacity-100 scale-100 rotate-0" 
              : "opacity-0 scale-0 -rotate-90"
          )} 
        />
      </div>
      
      {/* Background icons for extra visual feedback */}
      <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none">
        <Sun 
          className={cn(
            "h-3 w-3 transition-all duration-300",
            isDark 
              ? "opacity-30 text-white/30" 
              : "opacity-60 text-amber-500"
          )} 
        />
        <Moon 
          className={cn(
            "h-3 w-3 transition-all duration-300",
            isDark 
              ? "opacity-60 text-white" 
              : "opacity-30 text-slate-400"
          )} 
        />
      </div>
    </button>
  );
}