import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import {
  Cloud,
  LayoutDashboard,
  Files,
  Clock,
  UploadCloud,
  Search,
  Settings as SettingsIcon,
  Info,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  Monitor,
  MessageSquare,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Menu,
  X,
  HelpCircle,
  Layers,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import {
  api,
  bytes,
  type Stats,
  type AWS,
  type Settings,
  type FileRecord,
} from "./api";
import { Modal, Badge, FileIcon } from "./components";
import { usePreference } from "./preferences";
import FileManager from "./FileExplorer";
import Upload from "./Upload";
import SmartSearch from "./SmartSearch";
import DocumentPreview from "./DocumentPreview";
import LocalAIStatus from "./LocalAIStatus";
const AskCloudVault = lazy(() => import("./AskCloudVault"));
type Page =
  | "Overview"
  | "My Files"
  | "Recent"
  | "Upload"
  | "Smart Search"
  | "Ask CloudVault"
  | "Settings"
  | "About Project"
  | "Help and shortcuts";
const primary = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "My Files", icon: Files },
  { name: "Recent", icon: Clock },
  { name: "Upload", icon: UploadCloud },
  { name: "Smart Search", icon: Search },
  { name: "Ask CloudVault", icon: MessageSquare },
] as const;
const secondary = [
  { name: "Settings", icon: SettingsIcon },
  { name: "About Project", icon: Info },
  { name: "Help and shortcuts", icon: HelpCircle },
] as const;
const descriptions: Record<Page, string> = {
  Overview: "Your files, their contents, and the connections between them.",
  "My Files": "Manage your private cloud collection.",
  Recent: "Your most recently uploaded files.",
  Upload: "Private storage. Searchable knowledge.",
  "Smart Search": "Find a filename, an exact phrase, or an idea.",
  "Ask CloudVault":
    "Answers grounded in your documents, with evidence you can open.",
  Settings: "Cloud storage and local intelligence.",
  "About Project": "The architecture behind your workspace.",
  "Help and shortcuts": "A few useful ways to move faster.",
};
export default function Workspace() {
  const [page, setPage] = useState<Page>("Overview"),
    [mobile, setMobile] = useState(false),
    [collapsed, setCollapsed] = usePreference("sidebarCollapsed", false),
    [theme, setTheme] = usePreference<"light" | "dark" | "system">(
      "theme",
      "system",
    );
  const [stats, setStats] = useState<Stats | null>(null),
    [aws, setAws] = useState<AWS | null>(null),
    [settings, setSettings] = useState<Settings | null>(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [awsError, setAwsError] = useState("");
  const [command, setCommand] = useState(false),
    [commandQuery, setCommandQuery] = useState(""),
    [matches, setMatches] = useState<FileRecord[]>([]),
    [preview, setPreview] = useState<FileRecord | null>(null),
    [query, setQuery] = useState(""),
    [scope, setScope] = useState<string[]>([]),
    [aiKey, setAiKey] = useState(0),
    [fileStatus, setFileStatus] = useState("");
  const go = useCallback((next: Page) => {
    setFileStatus("");
    setPage(next);
    setMobile(false);
    setCommand(false);
    setError("");
    window.scrollTo({ top: 0 });
  }, []);
  const askFiles = (ids: string[]) => {
    setScope(ids);
    setAiKey((n) => n + 1);
    go("Ask CloudVault");
  };
  const refresh = useCallback(async () => {
    try {
      const [s, c] = await Promise.all([
        api<Stats>("/stats"),
        api<Settings>("/settings"),
      ]);
      setStats(s);
      setSettings(c);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  const checkAWS = useCallback(async () => {
    setAwsError("");
    try {
      setAws(await api<AWS>("/aws/status"));
    } catch (e) {
      setAws(null);
      setAwsError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    void refresh();
    void checkAWS();
  }, [refresh, checkAWS]);
  useEffect(() => {
    if (
      !stats ||
      !((stats.statuses.pending || 0) + (stats.statuses.processing || 0))
    )
      return;
    const timer = setTimeout(() => void refresh(), 2500);
    return () => clearTimeout(timer);
  }, [stats, refresh]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme =
        theme === "system" ? (media.matches ? "dark" : "light") : theme;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommand((v) => !v);
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "u"
      ) {
        e.preventDefault();
        go("Upload");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [go]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 6500);
    return () => clearTimeout(t);
  }, [notice]);
  useEffect(() => {
    if (!command || !commandQuery.trim()) {
      setMatches([]);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(() => {
      void api<{ items: FileRecord[] }>(
        "/files?" + new URLSearchParams({ q: commandQuery, page_size: "5" }),
        { signal: controller.signal },
      )
        .then((r) => setMatches(r.items))
        .catch(() => {});
    }, 150);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [command, commandQuery]);
  const types = Object.keys(stats?.types || {}).filter((t) => t !== "other");
  const nav = () => (
    <>
      <div className="nav-label">WORKSPACE</div>
      {primary.map(({ name, icon: Icon }) => (
        <button
          key={name}
          title={name}
          aria-label={name}
          aria-current={page === name ? "page" : undefined}
          className={"nav-item " + (page === name ? "active" : "")}
          onClick={() => go(name)}
        >
          <Icon size={18} />
          <span>{name}</span>
          {name === "Ask CloudVault" && <i>AI</i>}
        </button>
      ))}
      <div className="nav-label secondary-label">PREFERENCES</div>
      {secondary.map(({ name, icon: Icon }) => (
        <button
          key={name}
          title={name}
          aria-label={name}
          aria-current={page === name ? "page" : undefined}
          className={"nav-item " + (page === name ? "active" : "")}
          onClick={() => go(name)}
        >
          <Icon size={17} />
          <span>{name}</span>
        </button>
      ))}
    </>
  );
  return (
    <div className={"app-shell " + (collapsed ? "is-collapsed" : "")}>
      <a className="skip-link" href="#workspace-content">
        Skip to content
      </a>
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => go("Overview")}
          aria-label="CloudVault overview"
        >
          <span className="logo">
            <Cloud size={23} />
          </span>
          <span>
            CloudVault<small>PERSONAL WORKSPACE</small>
          </span>
        </button>
        <nav aria-label="Main navigation">{nav()}</nav>
        <div className="sidebar-bottom">
          <div className="local-indicator">
            <ShieldCheck size={16} />
            <span>Private cloud. Local AI.</span>
          </div>
          <div className="workspace-person">
            <span className="avatar">CV</span>
            <div>
              Personal workspace<small>CloudVault 2.0</small>
            </div>
            <button
              className="icon-button collapse-button"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <PanelLeftOpen size={16} />
              ) : (
                <PanelLeftClose size={16} />
              )}
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{page}</strong>
          </div>
          <div className="top-actions">
            <button className="global-search" onClick={() => setCommand(true)}>
              <Search size={15} />
              <span>Find anything…</span>
              <kbd>Ctrl K</kbd>
            </button>
            <span
              className={"cloud-chip " + (aws?.connected ? "connected" : "")}
              title={awsError || "Actual S3 connection"}
            >
              <span />
              {aws?.connected
                ? "S3 connected"
                : awsError
                  ? "S3 unavailable"
                  : "Checking S3"}
            </span>
            <button
              className="icon-button theme-toggle"
              aria-label={"Theme: " + theme + ". Change theme"}
              title={"Theme: " + theme}
              onClick={() =>
                setTheme(
                  theme === "system"
                    ? "light"
                    : theme === "light"
                      ? "dark"
                      : "system",
                )
              }
            >
              {theme === "system" ? (
                <Monitor size={18} />
              ) : theme === "light" ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>
          </div>
        </header>
        <main id="workspace-content" tabIndex={-1}>
          <div className="page-header">
            <div>
              <div className="eyebrow">
                CLOUDVAULT /{" "}
                {page === "Overview" ? "WORKSPACE" : page.toUpperCase()}
              </div>
              <h1>
                {page === "Overview"
                  ? "A place for every file. Context for every question."
                  : page}
              </h1>
              <p>{descriptions[page]}</p>
            </div>
            {page !== "Upload" && (
              <button className="primary" onClick={() => go("Upload")}>
                <UploadCloud size={16} />
                Upload files
              </button>
            )}
          </div>
          {error && (
            <div className="alert error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button
                className="icon-button"
                aria-label="Dismiss error"
                onClick={() => setError("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {notice && (
            <div className="toast" role="status">
              <CheckCircle2 size={17} />
              <span>{notice}</span>
              <button
                className="icon-button"
                aria-label="Dismiss notification"
                onClick={() => setNotice("")}
              >
                <X size={15} />
              </button>
            </div>
          )}
          {page === "Overview" && (
            <>
              <div className="overview-top">
                <section className="knowledge-entry">
                  <div className="entry-label">
                    <span className="mini-emblem">
                      <Layers size={16} />
                    </span>
                    YOUR KNOWLEDGE, CONNECTED
                  </div>
                  <h2>
                    The answer is already
                    <br />
                    in your files.
                  </h2>
                  <p>
                    Bring together the details. Ask across your documents and
                    trace every answer to its source.
                  </p>
                  <button className="ask-entry" onClick={() => askFiles([])}>
                    <MessageSquare size={18} />
                    <span>What would you like to understand?</span>
                    <kbd>Ask AI</kbd>
                  </button>
                  <div className="entry-foot">
                    <ShieldCheck size={13} />
                    Private inference on this computer<span>·</span>Originals in
                    Amazon S3
                  </div>
                </section>
                <section className="collection-summary">
                  <div className="section-head">
                    <h2>Your collection</h2>
                    <span className="caption">LIVE WORKSPACE DATA</span>
                  </div>
                  <div className="overview-metrics">
                    {[
                      {
                        label: "Stored files",
                        value: stats?.total_files,
                        note: "Originals in S3",
                        target: "My Files",
                      },
                      {
                        label: "Cloud storage",
                        value: stats ? bytes(stats.total_bytes) : undefined,
                        note: "Managed collection",
                        target: "My Files",
                      },
                      {
                        label: "Searchable files",
                        value: stats ? stats.statuses.indexed || 0 : undefined,
                        note: stats
                          ? stats.chunks + " indexed passages"
                          : "Loading index",
                        target: "Smart Search",
                      },
                      {
                        label: "Needs attention",
                        value: stats
                          ? (stats.statuses.failed || 0) +
                            (stats.statuses.upload_failed || 0)
                          : undefined,
                        note: stats
                          ? (stats.statuses.pending || 0) +
                            (stats.statuses.processing || 0) +
                            " processing"
                          : "Loading status",
                        target: "My Files",
                      },
                    ].map((s) => (
                      <button
                        key={s.label}
                        onClick={() => go(s.target as Page)}
                      >
                        <span>{s.label}</span>
                        <strong>{s.value ?? "—"}</strong>
                        <small>{s.note}</small>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
              <div className="quick-links">
                {[
                  {
                    title: "Upload something new",
                    copy: "Store originals privately",
                    icon: UploadCloud,
                    target: "Upload",
                  },
                  {
                    title: "Find a detail",
                    copy: "Search by words or meaning",
                    icon: Search,
                    target: "Smart Search",
                  },
                  {
                    title: "Explore your files",
                    copy: "Browse, preview and organize",
                    icon: Files,
                    target: "My Files",
                  },
                ].map((a) => (
                  <button key={a.title} onClick={() => go(a.target as Page)}>
                    <span className="quick-icon">
                      <a.icon size={19} />
                    </span>
                    <div>
                      <strong>{a.title}</strong>
                      <small>{a.copy}</small>
                    </div>
                    <ArrowUpRight size={15} />
                  </button>
                ))}
              </div>
              <div className="overview-bottom">
                <section className="panel recent">
                  <div className="section-head">
                    <div>
                      <h2>Recently added</h2>
                      <p>The latest files in your workspace.</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => go("Recent")}
                    >
                      View recent files
                      <ChevronRight size={14} />
                    </button>
                  </div>
                  {stats ? (
                    <FileManager
                      recent={stats.recent}
                      onAsk={askFiles}
                      onError={setError}
                      onNotice={setNotice}
                      onRefresh={refresh}
                    />
                  ) : (
                    <div
                      className="skeleton-block"
                      aria-label="Loading recent files"
                    />
                  )}
                </section>
                <section className="index-summary">
                  <div className="section-head">
                    <h2>Index health</h2>
                    <Layers size={17} />
                  </div>
                  {[
                    "indexed",
                    "pending",
                    "processing",
                    "unsupported",
                    "empty",
                    "failed",
                  ].map((s) => (
                    <button
                      className="health-row"
                      key={s}
                      onClick={() => {
                        go("My Files");
                        setFileStatus(s);
                      }}
                    >
                      <Badge status={s} />
                      <strong>{stats ? stats.statuses[s] || 0 : "—"}</strong>
                    </button>
                  ))}
                  <div className="distribution">
                    <h3>Collection by type</h3>
                    <div className="distribution-track">
                      {Object.entries(stats?.types || {}).map(
                        ([type, n], i) => (
                          <span
                            key={type}
                            style={{ flex: n, opacity: 1 - i * 0.12 }}
                            title={type + ": " + n}
                          />
                        ),
                      )}
                    </div>
                    <div className="distribution-labels">
                      {Object.entries(stats?.types || {}).map(([t, n]) => (
                        <span key={t}>
                          {t.toUpperCase()} <b>{n}</b>
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    className="cloud-footer"
                    onClick={() => go("Settings")}
                  >
                    <ShieldCheck size={16} />
                    <div>
                      {aws?.public_access_blocked
                        ? "Private S3 storage"
                        : "Review cloud status"}
                      <small>Sydney · ap-southeast-2</small>
                    </div>
                    <ChevronRight size={14} />
                  </button>
                </section>
              </div>
            </>
          )}
          {(page === "My Files" || page === "Recent") && (
            <section className="panel explorer-panel">
              <FileManager
                key={page + fileStatus}
                initialStatus={page === "My Files" ? fileStatus : ""}
                recentMode={page === "Recent"}
                types={types}
                onAsk={askFiles}
                onError={setError}
                onNotice={setNotice}
                onRefresh={refresh}
              />
            </section>
          )}
          <div hidden={page !== "Upload"}>
            <Upload
              maxMB={settings?.max_upload_mb || 25}
              onRefresh={refresh}
              onNotice={setNotice}
              onFiles={() => go("My Files")}
            />
          </div>
          {page === "Smart Search" && (
            <SmartSearch
              initialQuery={query}
              types={types}
              onAsk={askFiles}
              onError={setError}
              onRefresh={refresh}
            />
          )}
          {page === "Ask CloudVault" && (
            <Suspense
              fallback={
                <div className="skeleton-block">
                  Opening your document workspace…
                </div>
              }
            >
              <AskCloudVault
                key={aiKey}
                initialScope={scope}
                onNotice={setNotice}
              />
            </Suspense>
          )}
          {page === "Settings" && (
            <div className="settings-grid">
              <section className="panel">
                <div className="section-head">
                  <h2>Cloud storage</h2>
                  <button
                    className="secondary compact"
                    onClick={() => void checkAWS()}
                  >
                    <RefreshCw size={14} />
                    Check connection
                  </button>
                </div>
                {awsError && <p className="alert error">{awsError}</p>}
                <dl className="settings-list">
                  <dt>Connection</dt>
                  <dd>{aws?.connected ? "Connected" : "Unverified"}</dd>
                  <dt>S3 bucket</dt>
                  <dd>{settings?.bucket}</dd>
                  <dt>Region</dt>
                  <dd>ap-southeast-2 · Sydney</dd>
                  <dt>Object prefix</dt>
                  <dd>{settings?.prefix}</dd>
                  <dt>Public access</dt>
                  <dd>
                    {aws?.public_access_blocked
                      ? "All four blocks enabled"
                      : "Not verified"}
                  </dd>
                  <dt>Upload limit</dt>
                  <dd>{settings?.max_upload_mb} MiB per file</dd>
                </dl>
                <p className="caption">
                  Temporary AWS credentials stay on the backend. No public URLs
                  or additional AWS infrastructure.
                </p>
                <button
                  className="secondary"
                  onClick={async () => {
                    try {
                      await api("/import-test-object", { method: "POST" });
                      setNotice(
                        "Existing test object imported and protected from deletion.",
                      );
                      await refresh();
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  Import existing test object
                </button>
              </section>
              <section className="panel">
                <h2>Local intelligence</h2>
                <LocalAIStatus />
                <dl className="settings-list">
                  <dt>Embedding model</dt>
                  <dd>{settings?.model}</dd>
                  <dt>Vector dimension</dt>
                  <dd>{settings?.dimension ?? "Loads when needed"}</dd>
                  <dt>Generation model</dt>
                  <dd>Qwen2.5 3B · Local Ollama</dd>
                  <dt>Retrieval</dt>
                  <dd>Dense + FTS5 lexical + rank fusion</dd>
                  <dt>Chunk / overlap</dt>
                  <dd>220 / 32 tokens</dd>
                  <dt>Persistence</dt>
                  <dd>Local SQLite + private model cache</dd>
                </dl>
                <p className="caption">
                  Generation is separate from embeddings. The assistant shows
                  real runtime diagnostics and explicitly labels its fallback.
                </p>
                <button className="secondary" onClick={() => askFiles([])}>
                  Open document assistant
                </button>
              </section>
              <section className="panel">
                <h2>Appearance</h2>
                <p>Your preference stays in this browser.</p>
                <div className="segmented">
                  {(["light", "dark", "system"] as const).map((t) => (
                    <button
                      key={t}
                      className={theme === t ? "selected" : ""}
                      onClick={() => setTheme(t)}
                    >
                      {t[0].toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </section>
              <section className="panel">
                <h2>Storage reconciliation</h2>
                <p>
                  Compare managed keys with S3. This check never changes files.
                </p>
                <button
                  className="secondary"
                  onClick={async () => {
                    try {
                      const r = await api<{
                        untracked_objects: unknown[];
                        missing_objects: string[];
                      }>("/reconcile");
                      setNotice(
                        `${r.untracked_objects.length} untracked objects · ${r.missing_objects.length} missing originals`,
                      );
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  Run read-only check
                </button>
              </section>
            </div>
          )}
          {page === "About Project" && (
            <div className="about-content">
              <section className="about-intro">
                <span className="logo large">
                  <Cloud size={35} />
                </span>
                <div className="eyebrow">CLOUDVAULT 2.0</div>
                <h2>
                  Store intelligently.
                  <br />
                  Understand effortlessly.
                </h2>
                <p>
                  Private AWS file storage with local semantic search and
                  document-grounded answers.
                </p>
              </section>
              <div className="settings-grid">
                <section className="panel">
                  <h2>A deliberately hybrid architecture</h2>
                  <ol className="workflow">
                    <li>Original bytes live in private Amazon S3, Sydney.</li>
                    <li>Safe extraction and MiniLM embeddings run locally.</li>
                    <li>SQLite persists text, vectors and conversations.</li>
                    <li>Hybrid retrieval selects diverse relevant passages.</li>
                    <li>Local Qwen synthesizes supported, cited claims.</li>
                    <li>Sources open actual passages and original files.</li>
                  </ol>
                </section>
                <section className="panel">
                  <h2>Clear boundaries</h2>
                  <p>
                    Single-user localhost operation. No paid AI API, additional
                    AWS service, public sharing or unrestricted model tools.
                  </p>
                  <p>
                    Scanned documents require OCR, which is not implemented.
                    Citation checks validate identifiers and exact quotations;
                    they cannot guarantee every inference. Read the evidence
                    before relying on an answer.
                  </p>
                </section>
              </div>
              <section className="panel">
                <h2>Foundation & contributions</h2>
                <p>
                  The preserved{" "}
                  <a
                    href="https://github.com/HatmanStack/RAGStack-Lambda"
                    target="_blank"
                    rel="noreferrer"
                  >
                    HatmanStack / RAGStack-Lambda
                  </a>{" "}
                  foundation is acknowledged with its original LICENSE and
                  NOTICE. CloudVault's REST backend, SQLite index, file manager,
                  local retrieval and RAG assistant, visual system and
                  evaluation materials are documented separately. Original
                  upstream code remains available.
                </p>
              </section>
            </div>
          )}
          {page === "Help and shortcuts" && (
            <div className="settings-grid">
              <section className="panel">
                <h2>Move around your workspace</h2>
                {[
                  ["Command search", "Ctrl K"],
                  ["Upload files", "Ctrl Shift U"],
                  ["Send a question", "Ctrl Enter"],
                  ["Close a dialog", "Esc"],
                ].map(([label, key]) => (
                  <div className="shortcut-row" key={key}>
                    <span>{label}</span>
                    <kbd>{key}</kbd>
                  </div>
                ))}
              </section>
              <section className="panel">
                <h2>Search or ask?</h2>
                <p>
                  <strong>Smart Search</strong> finds originals by filename,
                  exact phrase, meaning or hybrid ranking.
                </p>
                <p>
                  <strong>Ask CloudVault</strong> synthesizes retrieved
                  evidence. Select files to constrain scope, open citations to
                  inspect passages, and download originals.
                </p>
                <p>
                  Unsupported formats can still be stored. Similarity scores are
                  not accuracy percentages.
                </p>
              </section>
            </div>
          )}
          <footer>
            <span>
              <ShieldCheck size={13} />
              Private storage · Local intelligence
            </span>
            <span>CloudVault 2.0</span>
            <button className="text-button" onClick={() => void refresh()}>
              Refresh workspace
            </button>
          </footer>
        </main>
      </div>
      {mobile && (
        <Modal title="Navigate workspace" onClose={() => setMobile(false)}>
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {nav()}
          </nav>
        </Modal>
      )}
      {command && (
        <Modal title="Find anything" onClose={() => setCommand(false)}>
          <div className="command-input">
            <Search size={20} />
            <input
              autoFocus
              aria-label="Command search"
              value={commandQuery}
              onChange={(e) => setCommandQuery(e.target.value)}
              placeholder="Find a page or filename…"
            />
          </div>
          <div className="command-results">
            {[...primary, ...secondary]
              .filter((n) =>
                n.name.toLowerCase().includes(commandQuery.toLowerCase()),
              )
              .map((n) => (
                <button key={n.name} onClick={() => go(n.name)}>
                  <n.icon size={17} />
                  <span>{n.name}</span>
                  <ChevronRight size={14} />
                </button>
              ))}
            {matches.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setPreview(f);
                  setCommand(false);
                }}
              >
                <FileIcon extension={f.extension} />
                <span>
                  {f.name}
                  <small>Open file</small>
                </span>
              </button>
            ))}
            {commandQuery && (
              <button
                onClick={() => {
                  setQuery(commandQuery);
                  go("Smart Search");
                }}
              >
                <Search size={17} />
                <span>Search contents for “{commandQuery}”</span>
              </button>
            )}
          </div>
          <p className="caption">
            Local filenames and navigation only. Search stays private.
          </p>
        </Modal>
      )}
      {preview && (
        <DocumentPreview
          file={preview}
          onClose={() => setPreview(null)}
          onAsk={askFiles}
        />
      )}
    </div>
  );
}
