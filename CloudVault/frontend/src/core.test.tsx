import { describe, it, expect, vi, afterEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Badge, Highlight } from "./components";
import { api, bytes } from "./api";
import { readPreference } from "./preferences";
describe("resilient local preferences", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("recovers from unavailable browser storage", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("denied");
      },
    });
    expect(readPreference("theme", "system")).toBe("system");
  });
  it("recovers from damaged persisted JSON", () => {
    vi.stubGlobal("localStorage", { getItem: () => "{damaged" });
    expect(readPreference("view", "list")).toBe("list");
  });
});
describe("safe content and truthful display", () => {
  it("escapes uploaded HTML in search snippets", () => {
    const html = renderToStaticMarkup(
      <Highlight text={"<script>alert(1)</script> cloud"} term="cloud" />,
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("<mark>cloud</mark>");
  });
  it("highlights a case insensitive literal phrase", () => {
    expect(
      renderToStaticMarkup(
        <Highlight text="A REMOTELY MANAGED store" term="remotely managed" />,
      ),
    ).toContain("<mark>REMOTELY MANAGED</mark>");
  });
  it("handles no literal match without fabricating one", () => {
    expect(renderToStaticMarkup(<Highlight text="solar" term="wind" />)).toBe(
      "solar",
    );
  });
  it("does not mark unsupported files as indexed", () => {
    const html = renderToStaticMarkup(<Badge status="unsupported" />);
    expect(html).toContain("unsupported");
    expect(html).not.toContain("indexed");
  });
  it("formats measured byte sizes", () => {
    expect(bytes(0)).toBe("0 B");
    expect(bytes(1024)).toBe("1.0 KB");
    expect(bytes(1048576)).toBe("1.00 MB");
  });
});
describe("REST error handling", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("returns server data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ total: 8 }) }),
    );
    expect(await api("/stats")).toEqual({ total: 8 });
  });
  it("surfaces AWS failures instead of success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ detail: "AWS session expired" }),
      }),
    );
    await expect(api("/files")).rejects.toThrow("AWS session expired");
  });
  it("handles non JSON backend errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => {
          throw new Error("HTML");
        },
      }),
    );
    await expect(api("/files")).rejects.toThrow("Request failed");
  });
});
