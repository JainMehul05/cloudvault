import { useEffect, useState } from "react";
import { ArrowDownToLine, MessageSquare, FileText } from "lucide-react";
import { api, bytes, type FileRecord } from "./api";
import { Badge, Modal } from "./components";
type Section = { chunk_id: number; section: string; text: string };
export default function DocumentPreview({
  file,
  passage,
  chunkId,
  onClose,
  onAsk,
}: {
  file: FileRecord;
  passage?: string;
  chunkId?: number;
  onClose: () => void;
  onAsk?: (ids: string[]) => void;
}) {
  const [data, setData] = useState<{
      text: string;
      sections: Section[];
      truncated: boolean;
    } | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    void api<{ text: string; sections: Section[]; truncated: boolean }>(
      "/files/" + file.id + "/preview",
      { signal: controller.signal },
    )
      .then(setData)
      .catch((e) => {
        if (!controller.signal.aborted) setError((e as Error).message);
      });
    return () => controller.abort();
  }, [file.id]);
  const raster = [".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(
    file.extension,
  );
  return (
    <Modal title={file.name} onClose={onClose}>
      <div className="preview-meta">
        <Badge status={file.status} />
        <span>{bytes(file.size)}</span>
        <span>{file.chunk_count} chunks</span>
      </div>
      {error && (
        <p role="alert" className="danger-text">
          {error}
        </p>
      )}
      {raster ? (
        <img
          className="raster-preview"
          src={"/api/files/" + file.id + "/image"}
          alt={"Preview of " + file.name}
        />
      ) : passage ? (
        <div className="cited-passage">
          <span className="eyebrow">
            CITED EVIDENCE{chunkId ? " · CHUNK " + chunkId : ""}
          </span>
          <blockquote>{passage}</blockquote>
        </div>
      ) : data?.sections?.length ? (
        <div className="section-preview">
          {data.sections.map((s) => (
            <section
              key={s.chunk_id}
              className={s.chunk_id === chunkId ? "highlighted-section" : ""}
            >
              <h3>
                <FileText size={14} />
                {s.section} <small>Chunk {s.chunk_id}</small>
              </h3>
              <p>{s.text}</p>
            </section>
          ))}
        </div>
      ) : (
        <pre className="preview">
          {data
            ? data.text ||
              "No extracted text. The original file is available to download."
            : "Loading document…"}
        </pre>
      )}
      {data?.truncated && (
        <p className="caption">
          Preview is limited to the first 50,000 extracted characters.
        </p>
      )}
      <details className="advanced-metadata">
        <summary>Document details</summary>
        <dl>
          <dt>Original filename</dt>
          <dd>{file.original_name}</dd>
          <dt>MIME type</dt>
          <dd>{file.mime}</dd>
          <dt>Uploaded</dt>
          <dd>{new Date(file.created_at).toLocaleString()}</dd>
          <dt>S3 key</dt>
          <dd>{file.object_key}</dd>
          <dt>SHA256</dt>
          <dd>{file.sha256}</dd>
        </dl>
      </details>
      <div className="preview-actions">
        <a
          className="secondary"
          download={file.name}
          href={"/api/files/" + file.id + "/download"}
        >
          <ArrowDownToLine size={16} />
          Download original
        </a>
        {onAsk && (
          <button
            className="primary"
            disabled={file.status !== "indexed"}
            onClick={() => {
              onClose();
              onAsk([file.id]);
            }}
          >
            <MessageSquare size={16} />
            Ask about this file
          </button>
        )}
      </div>
    </Modal>
  );
}
