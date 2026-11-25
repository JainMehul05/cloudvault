import { lazy, Suspense, useEffect, useState } from "react";
import Landing from "./Landing";
import { pageForPath, pagePaths, navigatePage } from "./routes";
const Workspace = lazy(() => import("./Workspace"));
export default function Application() {
  const [workspace, setWorkspace] = useState(
    location.pathname.startsWith("/workspace"),
  );
  useEffect(() => {
    const update = () =>
      setWorkspace(location.pathname.startsWith("/workspace"));
    window.addEventListener("popstate", update);
    window.addEventListener("cloudvault:navigate", update);
    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("cloudvault:navigate", update);
    };
  }, []);
  useEffect(() => {
    const follow = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = (
        event.target as Element | null
      )?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, location.origin);
      if (
        url.origin !== location.origin ||
        !Object.values(pagePaths).some(
          (path) => path === url.pathname.replace(/\/$/, ""),
        )
      )
        return;
      event.preventDefault();
      navigatePage(pageForPath(url.pathname));
      window.scrollTo({ top: 0 });
    };
    document.addEventListener("click", follow);
    return () => document.removeEventListener("click", follow);
  }, []);
  return workspace ? (
    <Suspense
      fallback={
        <main className="route-loading" role="status">
          Opening your workspace…
        </main>
      }
    >
      <Workspace />
    </Suspense>
  ) : (
    <Landing />
  );
}
