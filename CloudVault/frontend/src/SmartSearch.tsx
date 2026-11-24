import { useState } from "react";
import { Search, LoaderCircle, ArrowDownToLine, Eye } from "lucide-react";
import { api, bytes, type SearchResult } from "./api";
import { Badge, FileIcon, Empty, Highlight, Modal } from "./components";
import { usePreference } from "./preferences";
export default function SmartSearch({
  initialQuery,
  types,
  onError,
  onRefresh,
  onAsk,
}: {
  initialQuery: string;
  types: string[];
  onError: (s: string) => void;
  onRefresh: () => Promise<void>;
  onAsk?: (ids: string[]) => void;
}) {
  const [history, setHistory] = usePreference<string[]>("recentSearches", []);
  const [query, setQuery] = useState(initialQuery),
    [mode, setMode] = useState("semantic"),
    [ext, setExt] = useState(""),
    [threshold, setThreshold] = useState("0.25"),
    [top, setTop] = useState("10"),
    [results, setResults] = useState<SearchResult[] | null>(null),
    [busy, setBusy] = useState(false),
    [searched, setSearched] = useState(""),
    [preview, setPreview] = useState<{ name: string; text: string } | null>(
      null,
    );
  async function run() {
    if (!query.trim() || busy) return;
    setBusy(true);
    setResults(null);
    try {
      const r = await api<{ results: SearchResult[] }>(
        "/search?" +
          new URLSearchParams({
            q: query,
            mode,
            extension: ext,
            threshold,
            top_k: top,
          }),
      );
      setResults(r.results);
      setSearched(query);
      setHistory((old) =>
        [query, ...old.filter((q) => q !== query)].slice(0, 8),
      );
      await onRefresh();
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <section className="panel search-panel">
        <div className="search-heading">
          <span className="search-emblem">
            <Search size={24} />
          </span>
          <div>
            <h2>Find the file behind the idea.</h2>
            <p>Search the contents of your documents, your way.</p>
          </div>
        </div>
        <div className="mode-tabs" role="group" aria-label="Search mode">
          {["semantic", "keyword", "hybrid", "filename"].map((m) => (
            <button
              key={m}
              disabled={busy}
              className={mode === m ? "selected" : ""}
              onClick={() => {
                setMode(m);
                setResults(null);
              }}
            >
              {m === "keyword"
                ? "Exact keyword"
                : m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
        <form
          className="search-form"
          onSubmit={(e) => {
            e.preventDefault();
            void run();
          }}
        >
          <Search size={22} />
          <input
            aria-label="Search query"
            maxLength={1000}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              mode === "semantic"
                ? "e.g. Where can I keep my digital files online?"
                : "Enter a word, phrase, or filename…"
            }
          />
          <button className="primary" disabled={!query.trim() || busy}>
            {busy ? (
              <LoaderCircle size={17} className="spin" />
            ) : (
              <Search size={17} />
            )}
            Search
          </button>
        </form>
        <div className="search-options">
          <label>
            File type
            <select value={ext} onChange={(e) => setExt(e.target.value)}>
              <option value="">All file types</option>
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Top results
            <select value={top} onChange={(e) => setTop(e.target.value)}>
              <option>5</option>
              <option>10</option>
              <option>20</option>
            </select>
          </label>
          {["semantic", "hybrid"].includes(mode) && (
            <label>
              Minimum similarity
              <select
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              >
                <option value="0.15">0.15 · Broad</option>
                <option value="0.25">0.25 · Balanced</option>
                <option value="0.4">0.40 · Focused</option>
              </select>
            </label>
          )}
        </div>
        <p className="caption">
          {mode === "semantic"
            ? "Local MiniLM embeddings compare meaning using cosine similarity. Scores are not probabilities."
            : mode === "keyword"
              ? "Case-insensitive literal matching across complete extracted text. Enter phrases without quotation marks."
              : mode === "hybrid"
                ? "Reciprocal rank fusion combines semantic and exact-content rankings (k = 60)."
                : "Search current display filenames independently of indexing status."}
        </p>
      </section>
      {busy && (
        <div className="search-loading">
          <LoaderCircle className="spin" />
          Searching your index. The first AI query may take longer while the
          model loads.
        </div>
      )}
      {results !== null && (
        <div className="results">
          <div className="section-head">
            <h2>
              {results.length} matching{" "}
              {results.length === 1 ? "file" : "files"}
            </h2>
            <span className="muted">Results for “{searched}”</span>
            {results.length > 0 && onAsk && (
              <button
                className="secondary compact"
                onClick={() =>
                  onAsk(
                    results
                      .filter((r) => r.file.status === "indexed")
                      .map((r) => r.file.id),
                  )
                }
              >
                Ask about these results
              </button>
            )}
          </div>
          {results.length ? (
            results.map((r) => (
              <article className="panel result-card" key={r.file.id}>
                <div className="result-head">
                  <div className="file-name">
                    <FileIcon extension={r.file.extension} />
                    <div>
                      <h3>{r.file.name}</h3>
                      <small>
                        {bytes(r.file.size)} · {r.section}
                      </small>
                    </div>
                  </div>
                  <span className="score">
                    {r.score_kind === "cosine similarity"
                      ? r.score.toFixed(3)
                      : r.score_kind === "RRF"
                        ? r.score.toFixed(4)
                        : r.score}{" "}
                    <small>{r.score_kind}</small>
                  </span>
                </div>
                <p className="snippet">
                  <Highlight
                    text={r.snippet}
                    term={["keyword", "hybrid"].includes(mode) ? searched : ""}
                  />
                </p>
                <div className="result-footer">
                  <Badge status={r.file.status} />
                  <div>
                    <button
                      className="text-button"
                      onClick={async () => {
                        try {
                          const p = await api<{ text: string }>(
                            "/files/" + r.file.id + "/preview",
                          );
                          setPreview({ name: r.file.name, text: p.text });
                        } catch (e) {
                          onError((e as Error).message);
                        }
                      }}
                    >
                      <Eye size={16} />
                      Preview
                    </button>
                    <a
                      className="secondary compact"
                      href={"/api/files/" + r.file.id + "/download"}
                      download={r.file.name}
                    >
                      <ArrowDownToLine size={16} />
                      Download original
                    </a>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <Empty>
              <h3>No matching files</h3>
              <p>
                Try another phrase, lower the threshold, or check indexing
                status.
              </p>
            </Empty>
          )}
        </div>
      )}
      {results === null && !busy && (
        <section className="search-suggestions">
          {history.length > 0 && (
            <>
              <div className="section-head">
                <h3>Recent searches</h3>
                <button className="text-button" onClick={() => setHistory([])}>
                  Clear local history
                </button>
              </div>
              <div>
                {history.map((q) => (
                  <button key={q} onClick={() => setQuery(q)}>
                    <Search size={14} />
                    {q}
                  </button>
                ))}
              </div>
            </>
          )}
          <h3>Start with a question</h3>
          <p>Upload the included sample documents, then try:</p>
          <div>
            {[
              "Where can I save my digital files remotely?",
              "How do computers learn from examples?",
              "How can I protect information from hackers?",
            ].map((s) => (
              <button key={s} onClick={() => setQuery(s)}>
                <Search size={16} />
                {s}
              </button>
            ))}
          </div>
        </section>
      )}
      {preview && (
        <Modal title={preview.name} onClose={() => setPreview(null)}>
          <pre className="preview">
            {preview.text || "No extracted text available."}
          </pre>
        </Modal>
      )}
    </>
  );
}
