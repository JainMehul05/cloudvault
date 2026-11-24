import { useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  ArrowDownToLine,
  Pencil,
  Trash2,
  MoreHorizontal,
  Star,
  List,
  Grid2X2,
  AlignJustify,
  MessageSquare,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { api, bytes, type FileRecord } from "./api";
import { Badge, FileIcon, Empty, Modal } from "./components";
import { usePreference } from "./preferences";
import DocumentPreview from "./DocumentPreview";
export default function FileExplorer({
  recent,
  recentMode = false,
  initialStatus = "",
  types = [],
  onAsk,
  onError,
  onNotice,
  onRefresh,
}: {
  recent?: FileRecord[];
  recentMode?: boolean;
  initialStatus?: string;
  types?: string[];
  onAsk?: (ids: string[]) => void;
  onError: (s: string) => void;
  onNotice: (s: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const [files, setFiles] = useState<FileRecord[]>([]),
    [total, setTotal] = useState(0),
    [page, setPage] = useState(1),
    [q, setQ] = useState(""),
    [ext, setExt] = useState(""),
    [status, setStatus] = useState(initialStatus),
    [starred, setStarred] = useState(false),
    [sort, setSort] = useState("created_at"),
    [dir, setDir] = useState("desc"),
    [selected, setSelected] = useState<string[]>([]),
    [loading, setLoading] = useState(!recent);
  const [view, setView] = usePreference<"list" | "grid">("fileView", "list"),
    [density, setDensity] = usePreference<"comfortable" | "compact">(
      "density",
      "comfortable",
    );
  const [action, setAction] = useState<{
      type: "preview" | "rename" | "delete" | "menu";
      file: FileRecord;
    } | null>(null),
    [name, setName] = useState(""),
    [acting, setActing] = useState(false);
  const request = useRef<AbortController | null>(null);
  const load = useCallback(async () => {
    if (recent) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    try {
      const data = await api<{ items: FileRecord[]; total: number }>(
        "/files?" +
          new URLSearchParams({
            q,
            extension: ext,
            status,
            starred: String(starred),
            sort,
            direction: dir,
            page: String(page),
          }),
        { signal: controller.signal },
      );
      setFiles(data.items);
      setTotal(data.total);
    } catch (e) {
      if (!controller.signal.aborted) onError((e as Error).message);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [recent, q, ext, status, starred, sort, dir, page, onError]);
  useEffect(() => {
    const t = setTimeout(() => void load(), 180);
    return () => {
      clearTimeout(t);
      request.current?.abort();
    };
  }, [load]);
  useEffect(() => {
    if (!files.some((f) => ["pending", "processing"].includes(f.status)))
      return;
    const t = setTimeout(() => void load(), 2500);
    return () => clearTimeout(t);
  }, [files, load]);
  const open = (
    type: "preview" | "rename" | "delete" | "menu",
    file: FileRecord,
  ) => {
    setAction({ type, file });
    setName(file.name);
  };
  async function mutate() {
    if (!action || acting) return;
    setActing(true);
    try {
      await api(
        "/files/" +
          action.file.id +
          (action.type === "delete" ? "?confirm=true" : ""),
        {
          method: action.type === "delete" ? "DELETE" : "PATCH",
          ...(action.type === "rename"
            ? {
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
              }
            : {}),
        },
      );
      onNotice(
        action.type === "delete"
          ? "File and index deleted."
          : "Display name updated.",
      );
      setAction(null);
      setSelected([]);
      await load();
      await onRefresh();
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setActing(false);
    }
  }
  async function star(f: FileRecord) {
    try {
      await api("/files/" + f.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: !f.starred }),
      });
      setAction(null);
      await load();
      await onRefresh();
      onNotice(
        f.starred ? "Removed from starred files." : "Added to starred files.",
      );
    } catch (e) {
      onError((e as Error).message);
    }
  }
  async function reindex(f: FileRecord) {
    try {
      await api("/files/" + f.id + "/reindex", { method: "POST" });
      setAction(null);
      onNotice("Indexing queued.");
      await load();
      await onRefresh();
    } catch (e) {
      onError((e as Error).message);
    }
  }
  const items = recent
    ? [...recent].sort(
        (a, b) =>
          (sort === "size"
            ? a.size - b.size
            : String(a[sort as keyof FileRecord]).localeCompare(
                String(b[sort as keyof FileRecord]),
              )) * (dir === "asc" ? 1 : -1),
      )
    : files;
  const toggle = (id: string) =>
    setSelected((old) =>
      old.includes(id) ? old.filter((x) => x !== id) : [...old, id],
    );
  const askSelection = () =>
    onAsk?.(
      selected.filter((id) =>
        items.some((f) => f.id === id && f.status === "indexed"),
      ),
    );
  const sortBy = (key: string) => {
    if (sort === key) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(key);
      setDir("asc");
    }
  };
  return (
    <div className={"file-explorer " + density}>
      {!recent && (
        <>
          <div className="section-head">
            <div className="collection-tabs">
              <button
                className={!starred ? "selected" : ""}
                onClick={() => {
                  setStarred(false);
                  setPage(1);
                }}
              >
                {" "}
                {recentMode ? "Recent uploads" : "All files"}{" "}
                <span className="count">{total}</span>
              </button>
              <button
                className={starred ? "selected" : ""}
                onClick={() => {
                  setStarred(true);
                  setPage(1);
                }}
              >
                <Star size={14} />
                Starred
              </button>
            </div>
            <div className="view-controls">
              <button
                className="icon-button"
                title={
                  density === "compact"
                    ? "Comfortable density"
                    : "Compact density"
                }
                aria-label="Toggle file density"
                onClick={() =>
                  setDensity(density === "compact" ? "comfortable" : "compact")
                }
              >
                <AlignJustify size={17} />
              </button>
              <div className="segmented">
                <button
                  aria-label="List view"
                  aria-pressed={view === "list"}
                  className={view === "list" ? "selected" : ""}
                  onClick={() => setView("list")}
                >
                  <List size={17} />
                </button>
                <button
                  aria-label="Grid view"
                  aria-pressed={view === "grid"}
                  className={view === "grid" ? "selected" : ""}
                  onClick={() => setView("grid")}
                >
                  <Grid2X2 size={16} />
                </button>
              </div>
              <button
                className="icon-button"
                aria-label="Refresh files"
                title="Refresh files"
                onClick={() => void load()}
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
          <div className="toolbar">
            <label className="input-icon">
              <Search size={16} />
              <input
                aria-label="Search filenames"
                value={q}
                placeholder="Filter by filename…"
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                  setSelected([]);
                }}
              />
            </label>
            <select
              aria-label="File type"
              value={ext}
              onChange={(e) => {
                setExt(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All types</option>
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <select
              aria-label="Index status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Any index status</option>
              {[
                "indexed",
                "pending",
                "processing",
                "unsupported",
                "empty",
                "failed",
                "upload_failed",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              aria-label="Sort files"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="created_at">Date added</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
            </select>
            <button
              className="icon-button"
              aria-label={dir === "desc" ? "Sort ascending" : "Sort descending"}
              title={
                dir === "desc"
                  ? "Newest / largest first"
                  : "Oldest / smallest first"
              }
              onClick={() => setDir(dir === "asc" ? "desc" : "asc")}
            >
              {dir === "desc" ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
            </button>
          </div>
          {selected.length > 0 && (
            <div className="selection-toolbar">
              <span>{selected.length} selected on this page</span>
              <button
                className="secondary compact"
                disabled={
                  !selected.some((id) =>
                    items.some((f) => f.id === id && f.status === "indexed"),
                  )
                }
                onClick={askSelection}
              >
                <MessageSquare size={14} />
                Ask about selected
              </button>
              <button className="text-button" onClick={() => setSelected([])}>
                Clear
              </button>
            </div>
          )}
        </>
      )}
      {loading && !items.length ? (
        <div className="skeleton-block" role="status">
          Loading files…
        </div>
      ) : items.length ? (
        view === "grid" && !recent ? (
          <div className="file-grid">
            {items.map((f) => (
              <article
                key={f.id}
                className={
                  "file-card " + (selected.includes(f.id) ? "selected" : "")
                }
                onContextMenu={(e) => {
                  e.preventDefault();
                  open("menu", f);
                }}
              >
                <div className="file-card-top">
                  <input
                    type="checkbox"
                    aria-label={"Select " + f.name}
                    checked={selected.includes(f.id)}
                    onChange={() => toggle(f.id)}
                  />
                  <button
                    className="icon-button"
                    title={f.starred ? "Unstar file" : "Star file"}
                    aria-label={(f.starred ? "Unstar " : "Star ") + f.name}
                    onClick={() => void star(f)}
                  >
                    <Star
                      size={16}
                      fill={f.starred ? "currentColor" : "none"}
                    />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={"Actions for " + f.name}
                    onClick={() => open("menu", f)}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>
                <button
                  className="file-card-preview"
                  aria-label={"Preview " + f.name}
                  onClick={() => open("preview", f)}
                >
                  {[".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(
                    f.extension,
                  ) ? (
                    <img
                      loading="lazy"
                      src={"/api/files/" + f.id + "/image"}
                      alt=""
                    />
                  ) : (
                    <FileIcon extension={f.extension} />
                  )}
                </button>
                <button
                  className="file-title"
                  title={f.name}
                  onClick={() => open("preview", f)}
                >
                  {f.name}
                </button>
                <div className="file-card-meta">
                  <span>{bytes(f.size)}</span>
                  <Badge status={f.status} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {!recent && (
                    <th className="selection-cell">
                      <input
                        type="checkbox"
                        aria-label="Select all files on this page"
                        checked={
                          items.length > 0 &&
                          items.every((f) => selected.includes(f.id))
                        }
                        onChange={(e) =>
                          setSelected(
                            e.target.checked ? items.map((f) => f.id) : [],
                          )
                        }
                      />
                    </th>
                  )}
                  <th>
                    <button onClick={() => sortBy("name")}>
                      Name
                      {sort === "name" &&
                        (dir === "asc" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        ))}
                    </button>
                  </th>
                  <th>
                    <button onClick={() => sortBy("size")}>Size</button>
                  </th>
                  {!recent && (
                    <th>
                      <button onClick={() => sortBy("created_at")}>
                        Date added
                      </button>
                    </th>
                  )}
                  <th>Index</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((f) => (
                  <tr
                    key={f.id}
                    className={selected.includes(f.id) ? "selected" : ""}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      open("menu", f);
                    }}
                  >
                    {!recent && (
                      <td className="selection-cell">
                        <input
                          type="checkbox"
                          aria-label={"Select " + f.name}
                          checked={selected.includes(f.id)}
                          onChange={() => toggle(f.id)}
                        />
                      </td>
                    )}
                    <td>
                      <div className="file-name">
                        <FileIcon extension={f.extension} />
                        <div>
                          <button
                            className="file-title text-button"
                            title={f.name}
                            onClick={() => open("preview", f)}
                          >
                            {f.name}
                            {!!f.starred && (
                              <Star
                                className="star-indicator"
                                size={11}
                                fill="currentColor"
                              />
                            )}
                          </button>
                          <small>
                            {f.extension.slice(1).toUpperCase() || "FILE"} ·{" "}
                            {f.chunk_count} passages
                          </small>
                          {f.error && (
                            <small className="danger-text">{f.error}</small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{bytes(f.size)}</td>
                    {!recent && (
                      <td>
                        {new Date(f.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    )}
                    <td>
                      <Badge status={f.status} />
                    </td>
                    <td>
                      <button
                        className="icon-button"
                        title="File actions"
                        aria-label={"Actions for " + f.name}
                        onClick={() => open("menu", f)}
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <Empty>
          <h3>{starred ? "No starred files yet" : "No files to show"}</h3>
          <p>
            {starred
              ? "Star a file to keep it close."
              : "Upload a file or try a different filter."}
          </p>
        </Empty>
      )}
      {!recent && (
        <div className="pagination">
          <span>
            {total} files · Page {page} of {Math.max(1, Math.ceil(total / 20))}
          </span>
          <div>
            <button
              className="secondary compact"
              disabled={page === 1}
              onClick={() => {
                setPage((p) => p - 1);
                setSelected([]);
              }}
            >
              Previous
            </button>
            <button
              className="secondary compact"
              disabled={page * 20 >= total}
              onClick={() => {
                setPage((p) => p + 1);
                setSelected([]);
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
      {action?.type === "preview" && (
        <DocumentPreview
          file={action.file}
          onClose={() => setAction(null)}
          onAsk={onAsk}
        />
      )}
      {action && action.type !== "preview" && (
        <Modal
          title={
            action.type === "menu"
              ? "File actions"
              : action.type === "rename"
                ? "Rename file"
                : "Delete this file?"
          }
          onClose={() => {
            if (!acting) setAction(null);
          }}
        >
          {action.type === "menu" ? (
            <>
              <div className="menu-file">
                <FileIcon extension={action.file.extension} />
                <div>
                  <strong>{action.file.name}</strong>
                  <small>
                    {bytes(action.file.size)} · {action.file.chunk_count}{" "}
                    indexed passages
                  </small>
                </div>
              </div>
              <div className="file-action-list">
                <button onClick={() => open("preview", action.file)}>
                  <Eye size={17} />
                  Preview & details
                </button>
                <a
                  download={action.file.name}
                  href={"/api/files/" + action.file.id + "/download"}
                >
                  <ArrowDownToLine size={17} />
                  Download original
                </a>
                <button
                  disabled={action.file.status !== "indexed"}
                  onClick={() => {
                    onAsk?.([action.file.id]);
                    setAction(null);
                  }}
                >
                  <MessageSquare size={17} />
                  Ask about this file
                </button>
                <button onClick={() => void star(action.file)}>
                  <Star size={17} />
                  {action.file.starred ? "Remove star" : "Star file"}
                </button>
                <button onClick={() => open("rename", action.file)}>
                  <Pencil size={17} />
                  Rename
                </button>
                <button
                  disabled={[
                    "pending",
                    "processing",
                    "uploading",
                    "upload_failed",
                  ].includes(action.file.status)}
                  onClick={() => void reindex(action.file)}
                >
                  <RefreshCw size={17} />
                  Reindex contents
                </button>
                <button
                  className="danger-text"
                  disabled={!action.file.owned}
                  onClick={() => open("delete", action.file)}
                >
                  <Trash2 size={17} />
                  {action.file.owned
                    ? "Delete file"
                    : "Protected imported original"}
                </button>
              </div>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void mutate();
              }}
            >
              {action.type === "rename" ? (
                <label className="field-label">
                  Display filename
                  <input
                    aria-label="Display filename"
                    autoFocus
                    maxLength={180}
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <small>The S3 key and original bytes stay unchanged.</small>
                </label>
              ) : (
                <p>
                  Delete <strong>{action.file.name}</strong> permanently from S3
                  and remove its local search index? This cannot be undone.
                </p>
              )}
              <div className="dialog-actions">
                <button
                  type="button"
                  className="secondary"
                  disabled={acting}
                  onClick={() => setAction(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={acting || !name.trim()}
                  className={action.type === "delete" ? "danger" : "primary"}
                >
                  {acting
                    ? "Working…"
                    : action.type === "delete"
                      ? "Delete from S3"
                      : "Save name"}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
