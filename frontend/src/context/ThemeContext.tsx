"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ThemeMode } from "@/types";

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme provider that manages dark/light mode state.
 * Persists preference to localStorage and applies data-theme attribute to <html>.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  // Load saved theme preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("airq-theme") as ThemeMode | null;
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("airq-theme", theme);
    }
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // Always provide context value — before mount, use defaults to avoid SSR errors
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
