import { useRef, useState, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  LoaderCircle,
  ShieldCheck,
  X,
} from "lucide-react";
import { uploadFile, bytes, api, type FileRecord } from "./api";
export default function Upload({
  maxMB,
  onRefresh,
  onNotice,
  onFiles,
}: {
  maxMB: number;
  onRefresh: () => Promise<void>;
  onNotice: (s: string) => void;
  onFiles: () => void;
}) {
  const [queue, setQueue] = useState<
      {
        file: File;
        progress: number;
        status: string;
        error?: string;
        id?: string;
      }[]
    >([]),
    [uploading, setUploading] = useState(false),
    [drag, setDrag] = useState(false);
  const picker = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  useEffect(() => {
    const pending = queue.filter(
      (r) => r.id && ["stored", "pending", "processing"].includes(r.status),
    );
    if (!pending.length) return;
    const t = setTimeout(() => {
      void Promise.all(
        pending.map(async (r) => {
          try {
            const f = await api<FileRecord>("/files/" + r.id);
            setQueue((old) =>
              old.map((item) =>
                item.id === r.id
                  ? { ...item, status: f.status, error: f.error || undefined }
                  : item,
              ),
            );
          } catch {
            /* A visible file-list retry remains available. */
          }
        }),
      );
    }, 2000);
    return () => clearTimeout(t);
  }, [queue]);
  const add = (incoming: FileList) =>
    setQueue((old) => [
      ...old,
      ...Array.from(incoming)
        .filter(
          (file) =>
            !old.some(
              (r) =>
                r.file.name === file.name &&
                r.file.size === file.size &&
                r.file.lastModified === file.lastModified,
            ),
        )
        .map((file) => ({
          file,
          progress: 0,
          status: "queued",
        })),
    ]);
  async function start() {
    if (uploading) return;
    setUploading(true);
    let failures = 0;
    try {
      for (let i = 0; i < queue.length; i++) {
        if (!["queued", "upload_failed"].includes(queue[i].status)) continue;
        const file = queue[i].file;
        const update = (patch: Partial<(typeof queue)[number]>) =>
          setQueue((old) =>
            old.map((r, j) => (j === i ? { ...r, ...patch } : r)),
          );
        if (file.size > maxMB * 1048576) {
          update({ status: "upload_failed", error: "File exceeds size limit" });
          failures++;
          continue;
        }
        update({ status: "uploading", error: undefined });
        try {
          const stored = await uploadFile(file, (p) => update({ progress: p }));
          update({ status: "stored", progress: 100, id: stored.id });
        } catch (e) {
          update({ status: "upload_failed", error: (e as Error).message });
          failures++;
        }
      }
      onNotice(
        failures
          ? `Queue finished with ${failures} failed uploads. Review the errors below.`
          : "Files stored in S3. Open My Files to see indexing status.",
      );
      await onRefresh();
    } finally {
      setUploading(false);
    }
  }
  return (
    <div className="upload-layout">
      <section className="panel">
        <div
          className={"dropzone " + (drag ? "dragging" : "")}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            dragDepth.current++;
            if (!uploading) setDrag(true);
          }}
          onDragLeave={() => {
            dragDepth.current = Math.max(0, dragDepth.current - 1);
            if (!dragDepth.current) setDrag(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            dragDepth.current = 0;
            if (!uploading) add(e.dataTransfer.files);
          }}
        >
          <div className="upload-symbol">
            <UploadCloud size={36} />
          </div>
          <h2>Add to your collection.</h2>
          <p>Drag and drop your documents here</p>
          <span className="muted">or</span>
          <button
            className="primary"
            disabled={uploading}
            onClick={() => picker.current?.click()}
          >
            Browse files
          </button>
          <input
            ref={picker}
            aria-label="Choose files"
            type="file"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) add(e.target.files);
              e.target.value = "";
            }}
          />
          <small>Up to {maxMB} MB per file · Private Amazon S3 storage</small>
        </div>
        {queue.length > 0 && (
          <div className="upload-queue">
            <div className="section-head">
              <h2>
                Upload queue <span className="count">{queue.length}</span>{" "}
                <small>
                  {bytes(queue.reduce((n, r) => n + r.file.size, 0))} selected
                </small>
              </h2>
              <button
                className="text-button"
                disabled={uploading}
                onClick={() => setQueue([])}
              >
                Clear queue
              </button>
            </div>
            {queue.map((r, i) => (
              <div className="queue-row" key={i}>
                <FileText size={22} />
                <div>
                  <strong>{r.file.name}</strong>
                  <small>
                    {bytes(r.file.size)} ·{" "}
                    {r.status === "uploading" && r.progress === 100
                      ? "Transferring to S3…"
                      : r.status === "stored"
                        ? "Stored in S3 · Waiting for indexing"
                        : r.status === "failed"
                          ? "Indexing failed · Original retained"
                          : r.status.replaceAll("_", " ")}
                  </small>
                  {r.status === "uploading" && (
                    <progress max="100" value={r.progress} />
                  )}{" "}
                  {r.error && <small className="danger-text">{r.error}</small>}
                </div>
                {r.id ? (
                  <CheckCircle2 size={20} className="green" />
                ) : (
                  <button
                    className="icon-button"
                    aria-label={"Remove " + r.file.name}
                    disabled={uploading}
                    onClick={() =>
                      setQueue((old) => old.filter((_, j) => j !== i))
                    }
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
            ))}
            <button
              className="primary wide"
              disabled={
                uploading ||
                !queue.some((r) =>
                  ["queued", "upload_failed"].includes(r.status),
                )
              }
              onClick={() => void start()}
            >
              {uploading ? (
                <LoaderCircle size={17} className="spin" />
              ) : (
                <UploadCloud size={17} />
              )}{" "}
              {uploading
                ? "Uploading to Amazon S3…"
                : "Upload queued files / retry failures"}
            </button>
            <button className="text-button" onClick={onFiles}>
              View indexing status in My Files
            </button>
          </div>
        )}
      </section>
      <aside>
        <section className="panel upload-help">
          <ShieldCheck className="blue" size={28} />
          <h2>
            Stored privately.
            <br />
            Discovered intelligently.
          </h2>
          <p>
            Original bytes go to your private S3 bucket. AI embeddings are
            generated on this computer and stored in your private AWS vector
            index. Document answers are generated locally.
          </p>
          <hr />
          <h3>Content search supported</h3>
          <p>
            PDF, DOCX, TXT, Markdown, CSV, XLSX, JSON, HTML and common
            source-code files.
          </p>
          <h3>All other files</h3>
          <p>
            Stored and downloadable. Scanned PDFs and images need OCR; audio and
            video aren’t indexed.
          </p>
        </section>
      </aside>
    </div>
  );
}
