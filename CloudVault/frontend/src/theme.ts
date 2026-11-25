import { useEffect } from "react";
import { readPreference, usePreference } from "./preferences";
export type Theme = "light" | "dark" | "system";
export function applyTheme(theme: Theme) {
  const selected = ["light", "dark", "system"].includes(theme)
    ? theme
    : "system";
  document.documentElement.dataset.theme =
    selected === "system"
      ? matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : selected;
}
export function initializeTheme() {
  applyTheme(readPreference<Theme>("theme", "system"));
}
export function useTheme() {
  const [theme, setTheme] = usePreference<Theme>("theme", "system");
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => applyTheme(theme);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  return [theme, setTheme] as const;
}
