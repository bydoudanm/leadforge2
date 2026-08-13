import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "white";

export const THEME_STORAGE_KEY = "leadforge-theme";

export function resolveTheme(storedTheme: string | null, defaultTheme: Theme = "dark"): Theme {
  return storedTheme === "dark" || storedTheme === "white" ? storedTheme : defaultTheme;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  switchable = true,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (!switchable || typeof window === "undefined") return defaultTheme;
    return resolveTheme(window.localStorage.getItem(THEME_STORAGE_KEY), defaultTheme);
  });

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme === "dark" ? "dark" : "light";

    if (switchable) {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme, switchable]);

  const updateTheme = (nextTheme: Theme) => {
    if (switchable) setTheme(nextTheme);
  };

  const toggleTheme = () => {
    if (switchable) setTheme((currentTheme) => (currentTheme === "dark" ? "white" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme, toggleTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
