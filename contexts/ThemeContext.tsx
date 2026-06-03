import { createContext, useContext, useState, ReactNode } from "react";

export type ThemeMode = "dark" | "light";

export interface ThemeColors {
  background: string;
  card: string;
  cardBorder: string;
  text: string;
  subtext: string;
  muted: string;
  accent: string;
  danger: string;
  success: string;
  warning: string;
  headerBg: string;
}

const dark: ThemeColors = {
  background: "#0a0a0a",
  card: "#1f2937",
  cardBorder: "#374151",
  text: "#ffffff",
  subtext: "#9ca3af",
  muted: "#6b7280",
  accent: "#2563eb",
  danger: "#ef4444",
  success: "#22c55e",
  warning: "#f59e0b",
  headerBg: "#111827",
};

const light: ThemeColors = {
  background: "#f1f5f9",
  card: "#ffffff",
  cardBorder: "#e2e8f0",
  text: "#0f172a",
  subtext: "#475569",
  muted: "#94a3b8",
  accent: "#2563eb",
  danger: "#ef4444",
  success: "#16a34a",
  warning: "#d97706",
  headerBg: "#ffffff",
};

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  toggle: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  colors: dark,
  toggle: () => {},
  isDark: true,
});

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const toggle = () => setMode((m) => (m === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider
      value={{ mode, colors: mode === "dark" ? dark : light, toggle, isDark: mode === "dark" }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
