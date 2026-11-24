import { useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  Plus,
  Send,
  Square,
  Copy,
  RefreshCw,
  FileText,
  ChevronDown,
  ShieldCheck,
  Clock,
  Trash2,
  ArrowDown,
  ArrowDownToLine,
  LoaderCircle,
  PanelRight,
  Check,
} from "lucide-react";
import { api, type FileRecord } from "./api";
import { Modal } from "./components";
import DocumentPreview from "./DocumentPreview";
export type Source = {
  citation: number;
  file_id: string;
  chunk_id: number;
  filename: string;
  original_name: string;
  section: string;
  passage: string;
  similarity: number;
  rrf: number;
};
export type Answer = {
  mode: "generated" | "extractive" | "insufficient";
  answer: string;
  question: string;
  claims: { text: string; citations: number[]; quotes: string[] }[];
  sources: Source[];
  conversation_id: string;
  warning: string | null;
  model: string | null;
  coverage: {
    indexed_files: number;
    candidate_chunks: number;
    selected_chunks?: number;
  };
  timings: { retrieval_ms: number; total_ms: number };
};
type Exchange = { question: string; response: Answer };
type AIStatus = {
  available: boolean;
  model: string;
  reason?: string;
  busy: boolean;
};
type Conversation = { id: string; title: string; updated_at: string };
function cancelLocalRequest(requestId: string | null) {
  if (requestId)
    void api("/ai/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: requestId }),
    }).catch(() => {});
}
export default function AskCloudVault({
  initialScope,
  onNotice,
}: {
  initialScope: string[];
  onNotice: (text: string) => void;
}) {
  const [question, setQuestion] = useState(""),
    [turns, setTurns] = useState<Exchange[]>([]),
    [conversationId, setConversationId] = useState<string | null>(null),
    [scope, setScope] = useState(initialScope),
    [files, setFiles] = useState<FileRecord[]>([]),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState<AIStatus | null>(null),
    [error, setError] = useState(""),
    [interrupted, setInterrupted] = useState(false),
    [history, setHistory] = useState<Conversation[]>([]),
    [showHistory, setShowHistory] = useState(false),
    [deleteId, setDeleteId] = useState<string | null>(null),
    [showSources, setShowSources] = useState(true),
    [preview, setPreview] = useState<{
      file: FileRecord;
      source: Source;
    } | null>(null),
    [elapsed, setElapsed] = useState(0),
    [atBottom, setAtBottom] = useState(true),
    [copied, setCopied] = useState(false),
    [extractive, setExtractive] = useState(false);
  const controller = useRef<AbortController | null>(null),
    requestId = useRef<string | null>(null),
    end = useRef<HTMLDivElement>(null),
    scrollArea = useRef<HTMLDivElement>(null),
    nearBottom = useRef(true),
    composer = useRef<HTMLTextAreaElement>(null);
  const refreshHistory = () =>
    api<Conversation[]>("/ai/conversations")
      .then(setHistory)
      .catch(() => {});
  useEffect(() => {
    void api<AIStatus>("/ai/status")
      .then(setStatus)
      .catch(() =>
        setStatus({
          available: false,
          model: "qwen2.5:3b",
          reason: "Backend unavailable",
          busy: false,
        }),
      );
    void api<{ items: FileRecord[] }>("/files?status=indexed&page_size=100")
      .then((r) => setFiles(r.items))
      .catch((e) => setError((e as Error).message));
    void refreshHistory();
    return () => {
      cancelLocalRequest(requestId.current);
      controller.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (!busy) return;
    setElapsed(0);
    const t = setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [busy]);
  useEffect(() => {
    if (nearBottom.current)
      end.current?.scrollIntoView({
        block: "end",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  }, [turns, busy, error]);
  async function send(override?: string) {
    const text = (override ?? question).trim();
    if (text.length < 2 || busy) return;
    const abort = new AbortController();
    controller.current = abort;
    requestId.current = crypto.randomUUID();
    setBusy(true);
    setError("");
    setInterrupted(false);
    nearBottom.current = true;
    try {
      const response = await api<Answer>("/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: requestId.current,
          question: text,
          file_ids: scope,
          conversation_id: conversationId,
          extractive,
        }),
        signal: abort.signal,
      });
      setTurns((old) => [...old, { question: text, response }]);
      setConversationId(response.conversation_id);
      setQuestion("");
      void refreshHistory();
      void api<AIStatus>("/ai/status").then(setStatus);
    } catch (e) {
      if (abort.signal.aborted) {
        setInterrupted(true);
        setError(
          "Answer preparation stopped. No partial answer is presented as complete.",
        );
      } else setError((e as Error).message);
    } finally {
      setBusy(false);
      controller.current = null;
      requestId.current = null;
      composer.current?.focus();
    }
  }
  function newConversation() {
    if (busy) return;
    setTurns([]);
    setConversationId(null);
    setError("");
    setInterrupted(false);
    setQuestion("");
    composer.current?.focus();
  }
  async function loadConversation(id: string) {
    if (busy) return;
    try {
      const r = await api<{ exchanges: Exchange[]; file_ids: string[] }>(
        "/ai/conversations/" + id,
      );
      setTurns(r.exchanges);
      setScope(r.file_ids);
      setConversationId(id);
      setShowHistory(false);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function openSource(source: Source) {
    try {
      const file = await api<FileRecord>("/files/" + source.file_id);
      setPreview({ file, source });
    } catch (e) {
      setError("This source is no longer available: " + (e as Error).message);
    }
  }
  const latest = turns[turns.length - 1]?.response;
  return (
    <div className="assistant-workspace">
      <div className="assistant-toolbar">
        <div className="assistant-tools">
          <details className="scope-selector">
            <summary aria-label="Document scope">
              <FilesScope count={scope.length} />
              <ChevronDown size={14} />
            </summary>
            <div className="scope-menu">
              <strong>Search scope</strong>
              <p>
                {conversationId
                  ? "Start a new conversation to change scope."
                  : "Choose up to 30 indexed files, or search the collection."}
              </p>
              <button
                className="text-button"
                disabled={!!conversationId || busy}
                onClick={() => setScope([])}
              >
                All indexed documents
              </button>
              {files.map((f) => (
                <label key={f.id}>
                  <input
                    type="checkbox"
                    checked={scope.includes(f.id)}
                    disabled={
                      !!conversationId ||
                      busy ||
                      (!scope.includes(f.id) && scope.length >= 30)
                    }
                    onChange={(e) =>
                      setScope((old) =>
                        e.target.checked
                          ? [...old, f.id]
                          : old.filter((id) => id !== f.id),
                      )
                    }
                  />
                  <span>{f.name}</span>
                </label>
              ))}
            </div>
          </details>
          <span
            className={"model-status " + (status?.available ? "ready" : "")}
          >
            <span />
            {status?.available
              ? "Local Qwen ready"
              : "Extractive fallback available"}
          </span>
        </div>
        <div className="assistant-tools">
          <button
            className="secondary compact"
            disabled={busy}
            onClick={() => setShowHistory(!showHistory)}
          >
            <Clock size={15} />
            History
          </button>
          <button
            className="icon-button"
            aria-label="Toggle sources panel"
            title="Toggle sources"
            onClick={() => setShowSources(!showSources)}
          >
            <PanelRight size={17} />
          </button>
          <button
            className="secondary compact"
            disabled={busy}
            onClick={newConversation}
          >
            <Plus size={15} />
            New conversation
          </button>
        </div>
      </div>
      {scope.length > 0 && (
        <div className="scope-chips">
          <span>Searching only:</span>
          {scope.map((id) => (
            <span key={id}>
              {files.find((f) => f.id === id)?.name || "Selected document"}
            </span>
          ))}
        </div>
      )}
      {showHistory && (
        <section className="conversation-history">
          <div className="section-head">
            <h3>Saved on this computer</h3>
            <span className="caption">No external chat storage</span>
          </div>
          {history.length ? (
            history.map((c) => (
              <div
                className={conversationId === c.id ? "current" : ""}
                key={c.id}
              >
                <button onClick={() => void loadConversation(c.id)}>
                  <MessageSquare size={15} />
                  <span>
                    {c.title}
                    <small>{new Date(c.updated_at).toLocaleString()}</small>
                  </span>
                </button>
                <button
                  className="icon-button"
                  aria-label={"Delete conversation " + c.title}
                  title="Delete local conversation"
                  disabled={busy}
                  onClick={() => setDeleteId(c.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          ) : (
            <p>
              No conversations yet. Your completed answers will appear here.
            </p>
          )}
        </section>
      )}
      <div
        className={
          "assistant-columns " + (!showSources ? "sources-hidden" : "")
        }
      >
        <section className="answer-workspace">
          <div
            className="conversation-scroll"
            ref={scrollArea}
            onScroll={() => {
              const el = scrollArea.current;
              if (el) {
                nearBottom.current =
                  el.scrollHeight - el.scrollTop - el.clientHeight < 100;
                setAtBottom(nearBottom.current);
              }
            }}
          >
            {!turns.length && !busy && (
              <div className="assistant-empty">
                <span className="assistant-logo">
                  <MessageSquare size={28} />
                </span>
                <div className="eyebrow">ASK CLOUDVAULT</div>
                <h2>
                  Connect the details.
                  <br />
                  See the bigger picture.
                </h2>
                <p>
                  Ask a question across your indexed documents. Get a clear
                  answer, then inspect the evidence behind it.
                </p>
                <div className="suggested-questions">
                  {[
                    "How can an organization protect information stored in the cloud?",
                    "How are cloud storage and databases different?",
                    "How do computers learn from examples?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setQuestion(q);
                        composer.current?.focus();
                      }}
                    >
                      <MessageSquare size={15} />
                      {q}
                    </button>
                  ))}
                </div>
                <p className="assistant-privacy">
                  <ShieldCheck size={13} />
                  Private document context. Local inference.
                </p>
              </div>
            )}
            {turns.map((turn, i) => (
              <article className="answer-turn" key={i}>
                <div className="question-bubble">
                  <span className="eyebrow">YOUR QUESTION</span>
                  <p>{turn.question}</p>
                </div>
                <div className="answer-label">
                  <span className="mini-emblem">
                    <CloudAnswer />
                  </span>
                  <strong>CloudVault</strong>
                  <span className={"answer-mode " + turn.response.mode}>
                    {turn.response.mode === "generated"
                      ? "Grounded answer"
                      : turn.response.mode === "extractive"
                        ? "Extractive answer"
                        : "Insufficient evidence"}
                  </span>
                </div>
                {turn.response.warning && (
                  <p className="fallback-notice">{turn.response.warning}</p>
                )}
                {turn.response.mode !== "generated" && (
                  <p className="answer-intro">{turn.response.answer}</p>
                )}
                <div className="answer-body">
                  {turn.response.claims.map((claim, j) => (
                    <p key={j}>
                      {claim.text}{" "}
                      {claim.citations.map((n) => {
                        const source = turn.response.sources.find(
                          (s) => s.citation === n,
                        );
                        return source ? (
                          <button
                            className="citation"
                            key={n}
                            title={source.filename + " · " + source.section}
                            aria-label={"Source " + n + ": " + source.filename}
                            onClick={() => void openSource(source)}
                          >
                            [{n}]
                          </button>
                        ) : null;
                      })}
                    </p>
                  ))}
                </div>
                <div className="answer-meta">
                  <span>
                    {turn.response.sources.length} cited passages ·{" "}
                    {turn.response.coverage.indexed_files} indexed files
                    searched ·{" "}
                    {(turn.response.timings.total_ms / 1000).toFixed(1)}s
                  </span>
                  <div>
                    <button
                      className="icon-button"
                      aria-label="Copy answer"
                      title="Copy answer"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            turn.response.answer,
                          );
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1600);
                        } catch {
                          onNotice(
                            "Clipboard access unavailable. Select and copy the answer text.",
                          );
                        }
                      }}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    {i === turns.length - 1 && (
                      <button
                        className="icon-button"
                        title="Regenerate with fresh retrieval"
                        aria-label="Regenerate answer"
                        disabled={busy}
                        onClick={() => void send(turn.question)}
                      >
                        <RefreshCw size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
            {busy && (
              <div className="answer-loading" role="status">
                <LoaderCircle size={18} className="spin" />
                <div>
                  <strong>Retrieving evidence and preparing your answer</strong>
                  <small>
                    {elapsed}s elapsed · Local processing · You can stop this
                    request
                  </small>
                </div>
              </div>
            )}
            {error && (
              <div
                className={"inline-error " + (interrupted ? "interrupted" : "")}
                role="alert"
              >
                {error}
              </div>
            )}
            <div ref={end} />
          </div>
          {!atBottom && (
            <button
              className="jump-latest secondary compact"
              onClick={() => {
                nearBottom.current = true;
                end.current?.scrollIntoView({ block: "end" });
              }}
            >
              <ArrowDown size={14} />
              Jump to latest
            </button>
          )}
          <form
            className="question-composer"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <textarea
              ref={composer}
              aria-label="Ask a question"
              value={question}
              maxLength={1500}
              rows={3}
              placeholder={
                scope.length
                  ? "Ask about your selected documents…"
                  : "Ask a question about your documents…"
              }
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <div className="composer-footer">
              <div>
                <span>{question.length}/1500</span>
                <label>
                  <input
                    type="checkbox"
                    checked={extractive}
                    disabled={busy}
                    onChange={(e) => setExtractive(e.target.checked)}
                  />
                  Source excerpts only
                </label>
              </div>
              {busy ? (
                <button
                  className="secondary"
                  type="button"
                  onClick={() => {
                    cancelLocalRequest(requestId.current);
                    controller.current?.abort();
                  }}
                >
                  <Square size={13} />
                  Stop
                </button>
              ) : (
                <button
                  className="primary"
                  disabled={question.trim().length < 2}
                >
                  <Send size={15} />
                  Ask CloudVault
                </button>
              )}
            </div>
          </form>
          <p className="assistant-disclaimer">
            Answers use retrieved passages, not every page. Verify important
            claims against the cited sources.
          </p>
        </section>
        {showSources && (
          <aside className="sources-panel">
            <div className="section-head">
              <h2>Evidence</h2>
              <span className="count">{latest?.sources.length || 0}</span>
            </div>
            {latest?.sources.length ? (
              <>
                <p className="caption">
                  Actual passages supporting this answer. Open a source to
                  inspect its context.
                </p>
                {latest.sources.map((s) => (
                  <article className="source-card" key={s.citation}>
                    <button
                      className="source-title"
                      onClick={() => void openSource(s)}
                    >
                      <span className="citation-number">{s.citation}</span>
                      <span>
                        {s.filename}
                        <small>
                          {s.section} · Chunk {s.chunk_id}
                        </small>
                      </span>
                    </button>
                    <p>
                      {s.passage.slice(0, 190)}
                      {s.passage.length > 190 ? "…" : ""}
                    </p>
                    <div>
                      <span>{s.similarity.toFixed(3)} cosine</span>
                      <a
                        download={s.filename}
                        title={"Download " + s.filename}
                        aria-label={"Download " + s.filename}
                        href={"/api/files/" + s.file_id + "/download"}
                      >
                        <ArrowDownToLine size={14} />
                      </a>
                    </div>
                  </article>
                ))}
              </>
            ) : (
              <div className="sources-empty">
                <FileText size={26} />
                <h3>Evidence, not guesswork.</h3>
                <p>Relevant source passages appear here after your question.</p>
              </div>
            )}
            <div className="sources-foot">
              <ShieldCheck size={14} />
              Citations are checked against retrieved IDs and exact supporting
              quotations.
            </div>
          </aside>
        )}
      </div>
      {preview && (
        <DocumentPreview
          file={preview.file}
          passage={preview.source.passage}
          chunkId={preview.source.chunk_id}
          onClose={() => setPreview(null)}
        />
      )}
      {deleteId && (
        <Modal
          title="Delete local conversation?"
          onClose={() => setDeleteId(null)}
        >
          <p>
            This permanently removes this conversation from the local database.
            Your files and S3 originals are unaffected.
          </p>
          <div className="dialog-actions">
            <button className="secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </button>
            <button
              className="danger"
              onClick={async () => {
                try {
                  await api("/ai/conversations/" + deleteId + "?confirm=true", {
                    method: "DELETE",
                  });
                  if (conversationId === deleteId) newConversation();
                  setDeleteId(null);
                  await refreshHistory();
                  onNotice("Local conversation deleted.");
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Delete conversation
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function FilesScope({ count }: { count: number }) {
  return (
    <>
      <FileText size={15} />
      <span>
        {count
          ? count + " selected " + (count === 1 ? "document" : "documents")
          : "All indexed documents"}
      </span>
    </>
  );
}
function CloudAnswer() {
  return <MessageSquare size={14} />;
}
