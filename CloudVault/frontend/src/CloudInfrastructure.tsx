import { useEffect, useState } from "react";
import {
  Cloud,
  Cpu,
  ArrowDown,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
  CircleDashed,
} from "lucide-react";
import { api } from "./api";
type Service = { name: string; role: string; status: string; boundary: string };
type CloudState = {
  region: string;
  services: Service[];
  dense_backend: string;
  metadata_backend: string;
  generation: string;
  embedding: string;
  pending_metadata_sync: number;
  evidence_checked_at: string | null;
  note: string;
  pipeline_paused: boolean;
  financial_guard: {
    allowed: boolean;
    plan?: string;
    status?: string;
    credits_usd?: number;
    checked_at?: string;
    paid_upgrade_permitted: boolean;
  };
  monitoring: {
    Invocations?: number | null;
    Errors?: number | null;
    Duration?: number | null;
    checked_at?: string | null;
    window_minutes?: number;
  };
};
type Job = {
  file_id: string;
  correlation_id: string;
  state: string;
  size?: number;
  created_at: string;
  updated_at: string;
  test_fixture?: boolean;
  history?: { stage: string; at: string }[];
};
export default function CloudInfrastructure() {
  const [jobs, setJobs] = useState<Job[]>([]),
    [jobSource, setJobSource] = useState("checking");
  const [data, setData] = useState<CloudState | null>(null),
    [error, setError] = useState(""),
    [selected, setSelected] = useState("S3 Vectors"),
    [busy, setBusy] = useState(false);
  async function load() {
    setBusy(true);
    setError("");
    try {
      setData(await api<CloudState>("/cloud/status"));
      const result = await api<{ jobs: Job[]; source: string }>("/cloud/jobs");
      setJobs(result.jobs);
      setJobSource(result.source);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void api<{ jobs: Job[]; source: string }>("/cloud/jobs")
      .then((r) => {
        setJobs(r.jobs);
        setJobSource(r.source);
      })
      .catch(() => setJobSource("unavailable"));
    void api<CloudState>("/cloud/status")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);
  const detail = data?.services.find((s) => s.name === selected);
  return (
    <div className="infrastructure">
      <div className="cloud-control">
        <div>
          <span className="eyebrow">HYBRID BY DESIGN</span>
          <h2>A clear view of what runs where.</h2>
          <p>
            AWS holds durable data. Your laptop turns evidence into answers.
          </p>
        </div>
        <button
          className="secondary"
          disabled={busy}
          onClick={() => void load()}
        >
          <RefreshCw size={15} className={busy ? "spin" : ""} /> Refresh
          evidence
        </button>
      </div>
      {error && (
        <p className="alert error" role="alert">
          {error}
        </p>
      )}
      <div className="cloud-summary">
        <span>
          {data?.financial_guard?.allowed
            ? "Free plan verified"
            : "Cloud cost guard: paused"}{" "}
          ·{" "}
          {data?.financial_guard?.credits_usd != null
            ? "US$" +
              data.financial_guard.credits_usd.toFixed(2) +
              " credit at last check"
            : "Credit unverified"}
        </span>
        <span>
          <Cloud size={17} /> {data?.region || "Sydney"}
        </span>
        <span>
          Dense retrieval: <strong>{data?.dense_backend || "Checking"}</strong>
        </span>
        <span>
          Metadata: <strong>{data?.metadata_backend || "Checking"}</strong>
        </span>
        <span>
          Pending sync: <strong>{data?.pending_metadata_sync ?? "—"}</strong>
        </span>
      </div>
      <div className="architecture-grid">
        <section
          className="boundary cloud-boundary"
          aria-label="AWS service architecture"
        >
          <div className="boundary-label">
            <Cloud size={18} />
            <strong>AWS / SYDNEY</strong>
            <span>Private data plane</span>
          </div>
          <div className="service-grid">
            {data?.services.map((s) => (
              <button
                key={s.name}
                onClick={() => setSelected(s.name)}
                aria-pressed={selected === s.name}
                className={
                  "service-node " + (selected === s.name ? "selected" : "")
                }
              >
                <span>
                  {s.status === "live_verified" ? (
                    <CheckCircle2 size={17} />
                  ) : (
                    <CircleDashed size={17} />
                  )}
                </span>
                <strong>{s.name}</strong>
                <small>{s.role}</small>
                <i className={"service-state " + s.status}>
                  {s.status.replaceAll("_", " ")}
                </i>
              </button>
            ))}
          </div>
          <p className="boundary-foot">
            Only successful recorded operations are marked live verified.
            Inactive services are not counted as integrations.
          </p>
        </section>
        <div className="architecture-bridge">
          <ArrowDown size={22} />
          <span>
            Authenticated outbound requests
            <br />
            No cloud call to localhost
          </span>
        </div>
        <section
          className="boundary local-boundary"
          aria-label="Local service architecture"
        >
          <div className="boundary-label">
            <Cpu size={18} />
            <strong>THIS LAPTOP</strong>
            <span>Private intelligence</span>
          </div>
          <div className="local-pipeline">
            <div>
              <strong>React + FastAPI</strong>
              <small>Workspace &amp; trusted proxy</small>
            </div>
            <span>→</span>
            <div>
              <strong>MiniLM · 384D</strong>
              <small>Local embeddings</small>
            </div>
            <span>→</span>
            <div>
              <strong>Qwen + Ollama</strong>
              <small>Local answer generation</small>
            </div>
            <span>→</span>
            <div>
              <strong>Checked citations</strong>
              <small>Actual source passages</small>
            </div>
          </div>
          <p className="boundary-foot">
            SQLite preserves extracted text, conversations and fallback vectors.
            Generation is local, including when retrieval uses AWS.
          </p>
        </section>
      </div>
      <aside className="service-detail" aria-live="polite">
        <div>
          <span className="eyebrow">SELECTED SERVICE</span>
          <h2>{detail?.name || selected}</h2>
          <p>{detail?.role || "Select a service to inspect its role."}</p>
        </div>
        <div>
          <strong>{detail?.status.replaceAll("_", " ") || "Checking"}</strong>
          <p>{data?.note}</p>
          <small>
            Recorded evidence:{" "}
            {data?.evidence_checked_at
              ? new Date(data.evidence_checked_at).toLocaleString()
              : "Not yet available"}
          </small>
        </div>
        <a
          className="text-action"
          href="https://ap-southeast-2.console.aws.amazon.com/console/home?region=ap-southeast-2"
          target="_blank"
          rel="noreferrer"
        >
          Open AWS console <ArrowUpRight size={16} />
        </a>
      </aside>
      <section className="cloud-operations">
        <div className="section-head">
          <div>
            <span className="eyebrow">NATIVE CLOUDWATCH METRICS</span>
            <h2>Measured, not assumed.</h2>
          </div>
          <span className="caption">
            {data?.monitoring?.window_minutes || 30}-minute recorded window
          </span>
        </div>
        <div className="cloud-metrics">
          {[
            {
              label: "Lambda invocations",
              value: data?.monitoring?.Invocations,
            },
            { label: "Lambda errors", value: data?.monitoring?.Errors },
            {
              label: "Latest average duration",
              value:
                data?.monitoring?.Duration != null
                  ? data.monitoring.Duration.toFixed(1) + " ms"
                  : null,
            },
          ].map((m) => (
            <div key={m.label}>
              <span>{m.label}</span>
              <strong>{m.value ?? "Not yet available"}</strong>
            </div>
          ))}
        </div>
        <p className="muted">
          Metrics can arrive late. Snapshot:{" "}
          {data?.monitoring?.checked_at
            ? new Date(data.monitoring.checked_at).toLocaleString()
            : "Not recorded"}
          .{" "}
          {data?.pipeline_paused
            ? "Event processing is paused to conserve credits. Storage, cloud search and signed metadata reads remain available."
            : "A bounded cloud processing session is active."}
        </p>
      </section>
      <section className="cloud-operations">
        <div className="section-head">
          <div>
            <span className="eyebrow">ACTUAL CLOUD JOBS</span>
            <h2>The journey from upload to evidence.</h2>
          </div>
          <button
            className="secondary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await api("/cloud/reconcile", { method: "POST" });
                await load();
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <RefreshCw size={14} /> Sync waiting jobs
          </button>
        </div>
        {jobSource === "unavailable" ? (
          <p>
            Cloud jobs are unavailable. Your local file index remains usable.
          </p>
        ) : !jobs.length ? (
          <p className="muted">
            No recorded cloud jobs yet. A paused pipeline does not process new
            upload events.
          </p>
        ) : (
          jobs.map((job) => (
            <article className="cloud-job" key={job.correlation_id}>
              <div>
                <strong>
                  {job.test_fixture
                    ? "Isolated failure test"
                    : "Document " + job.file_id.slice(0, 8)}
                </strong>
                <span
                  className={
                    "service-state " +
                    (job.state === "searchable"
                      ? "live_verified"
                      : job.state === "failed"
                        ? "failed"
                        : "")
                  }
                >
                  {job.state.replaceAll("_", " ")}
                </span>
                <small>{new Date(job.created_at).toLocaleString()}</small>
              </div>
              <ol>
                {job.history?.map((step, i) => (
                  <li key={step.stage + i}>
                    {step.stage === "failed" ? (
                      <CircleDashed size={14} />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    <span>
                      {step.stage.replaceAll("_", " ")}
                      <small>{new Date(step.at).toLocaleTimeString()}</small>
                    </span>
                  </li>
                ))}
              </ol>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
