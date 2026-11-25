export const pagePaths = {
  Overview: "/workspace",
  "My Files": "/workspace/files",
  Starred: "/workspace/starred",
  Recent: "/workspace/recent",
  Upload: "/workspace/upload",
  "Smart Search": "/workspace/search",
  "Ask CloudVault": "/workspace/ask",
  "Cloud Infrastructure": "/workspace/cloud",
  Settings: "/workspace/settings",
  "About Project": "/workspace/about",
  "Help and shortcuts": "/workspace/help",
} as const;
export type Page = keyof typeof pagePaths;
export function pageForPath(path: string): Page {
  return (
    (Object.entries(pagePaths).find(
      ([, value]) => value === path.replace(/\/$/, ""),
    )?.[0] as Page) || "Overview"
  );
}
export function navigatePage(page: Page) {
  if (location.pathname !== pagePaths[page])
    history.pushState(null, "", pagePaths[page]);
  window.dispatchEvent(new Event("cloudvault:navigate"));
}
