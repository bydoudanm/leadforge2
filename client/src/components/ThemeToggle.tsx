import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  compact?: boolean;
}

export default function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "dark" ? "White" : "Dark";

  return (
    <button
      type="button"
      data-theme-control
      data-current-theme={theme}
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/60 text-slate-300 transition-colors hover:border-blue-400/60 hover:bg-slate-800 hover:text-white ${compact ? "h-8 w-8" : "px-3 py-2 text-xs"}`}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {!compact && <span>{nextTheme}</span>}
    </button>
  );
}
