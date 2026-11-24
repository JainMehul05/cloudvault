import { useEffect, useState } from "react";
export function readPreference<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem("cloudvault." + key);
    return value === null ? fallback : (JSON.parse(value) as T);
  } catch {
    return fallback;
  }
}
export function usePreference<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readPreference(key, fallback));
  useEffect(() => {
    try {
      localStorage.setItem("cloudvault." + key, JSON.stringify(value));
    } catch {
      /* Private browsing can disable persistence. */
    }
  }, [key, value]);
  return [value, setValue] as const;
}
