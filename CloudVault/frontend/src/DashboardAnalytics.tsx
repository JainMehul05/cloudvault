import { useEffect, useState } from "react";
import { ArrowUpRight, HardDrive, Files, Layers, Sparkles } from "lucide-react";
import { api, bytes } from "./api";
type Analytics = {
  total_files: number;
  total_bytes: number;
  chunks: number;
  statuses: Record<string, number>;
  storage: { type: string; files: number; bytes: number }[];
  activity: { date: string; files: number; bytes: number }[];
  checked_at: string;
  timezone: string;
};
const colors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
export default function DashboardAnalytics() {
  const [days, setDays] = useState(7),
    [data, setData] = useState<Analytics | null>(null),
    [error, setError] = useState(""),
    [ai, setAI] = useState<{ available: boolean; model: string } | null>(null);
  useEffect(() => {
    const abort = new AbortController();
    void api<Analytics>("/analytics?days=" + days, { signal: abort.signal })
      .then(setData)
      .catch((e) => {
        if (!abort.signal.aborted) setError(e.message);
      });
    return () => abort.abort();
  }, [days]);
  useEffect(() => {
    void api<{ available: boolean; model: string }>("/ai/status")
      .then(setAI)
      .catch(() => {});
  }, []);
  const maximum = Math.max(1, ...(data?.activity.map((d) => d.files) || []));
  let offset = 0;
  return (
    <section
      className="dashboard-analytics"
      aria-label="Actual workspace analytics"
    >
      {error && <p role="alert">Analytics unavailable: {error}</p>}
      <div className="dashboard-numbers">
        {[
          {
            label: "Files in your cloud",
            value: data?.total_files,
            icon: Files,
            href: "/workspace/files",
            note: "Originals in private S3",
          },
          {
            label: "Stored bytes",
            value: data ? bytes(data.total_bytes) : null,
            icon: HardDrive,
            href: "/workspace/files",
            note: "No artificial capacity limit",
          },
          {
            label: "Searchable documents",
            value: data ? data.statuses.indexed || 0 : null,
            icon: Sparkles,
            href: "/workspace/search",
            note: "Ready to retrieve",
          },
          {
            label: "Indexed passages",
            value: data?.chunks,
            icon: Layers,
            href: "/workspace/ask",
            note: "Evidence for your questions",
          },
        ].map((m) => (
          <a href={m.href} key={m.label}>
            <span>
              <m.icon size={16} />
              {m.label}
              <ArrowUpRight size={13} />
            </span>
            <strong>{m.value ?? "—"}</strong>
            <small>{m.note}</small>
          </a>
        ))}
      </div>
      <div className="analytics-grid">
        <figure className="analytics-panel">
          <figcaption>
            <div>
              <span className="eyebrow">YOUR COLLECTION</span>
              <h2>Storage, at a glance.</h2>
            </div>
            <span className="chart-unit">Original bytes</span>
          </figcaption>
          <div className="storage-chart">
            <svg
              viewBox="0 0 180 180"
              role="img"
              aria-label={
                data
                  ? `Storage distribution across ${data.total_files} files. Total ${bytes(data.total_bytes)}.`
                  : "Loading storage distribution"
              }
            >
              <circle
                cx="90"
                cy="90"
                r="66"
                fill="none"
                stroke="var(--border)"
                strokeWidth="19"
              />
              {data?.storage.map((s, i) => {
                const value = data.total_bytes
                  ? (s.bytes / data.total_bytes) * 414.69
                  : 0;
                const start = offset;
                offset += value;
                return (
                  <circle
                    key={s.type}
                    cx="90"
                    cy="90"
                    r="66"
                    fill="none"
                    stroke={colors[i % colors.length]}
                    strokeWidth="19"
                    strokeDasharray={`${value} ${414.69 - value}`}
                    strokeDashoffset={-start}
                    transform="rotate(-90 90 90)"
                  >
                    <title>
                      {s.type}: {bytes(s.bytes)}, {s.files} files
                    </title>
                  </circle>
                );
              })}
              <text x="90" y="87" textAnchor="middle" className="donut-total">
                {data ? bytes(data.total_bytes) : "—"}
              </text>
              <text x="90" y="107" textAnchor="middle" className="donut-label">
                IN YOUR COLLECTION
              </text>
            </svg>
            <ul className="chart-legend">
              {data?.storage.map((s, i) => (
                <li key={s.type}>
                  <i style={{ background: colors[i % colors.length] }} />
                  <span>
                    {s.type.toUpperCase()}
                    <small>
                      {s.files} {s.files === 1 ? "file" : "files"}
                    </small>
                  </span>
                  <strong>{bytes(s.bytes)}</strong>
                </li>
              ))}
              {data && !data.total_files && (
                <li>Your first upload will appear here.</li>
              )}
            </ul>
          </div>
        </figure>
        <figure className="analytics-panel">
          <figcaption>
            <div>
              <span className="eyebrow">ACTUAL UPLOAD HISTORY</span>
              <h2>A little more knowledge.</h2>
            </div>
            <select
              aria-label="Upload activity period"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </figcaption>
          <div className="activity-summary">
            <strong>
              {data?.activity.reduce((s, d) => s + d.files, 0) ?? "—"}
            </strong>
            <span>
              files added
              <br />
              <small>Recorded upload timestamps · UTC</small>
            </span>
          </div>
          <div
            className="activity-chart"
            role="img"
            aria-label={`Daily upload counts for the last ${days} days, UTC`}
          >
            <div className="chart-baseline" />
            {data?.activity.map((d, i) => (
              <div
                className="activity-day"
                key={d.date}
                title={`${d.date}: ${d.files} files · ${bytes(d.bytes)}`}
              >
                <div
                  className="activity-column"
                  style={{ height: `${(d.files / maximum) * 105}px` }}
                />
                <span>
                  {days === 7 || i === 0 || i % 7 === 0
                    ? new Date(d.date + "T00:00:00Z").toLocaleDateString(
                        undefined,
                        { day: "numeric", month: "short", timeZone: "UTC" },
                      )
                    : ""}
                </span>
              </div>
            ))}
          </div>
          <details className="chart-data">
            <summary>View accessible chart data</summary>
            <table>
              <thead>
                <tr>
                  <th>Date (UTC)</th>
                  <th>Files</th>
                  <th>Bytes</th>
                </tr>
              </thead>
              <tbody>
                {data?.activity.map((d) => (
                  <tr key={d.date}>
                    <td>{d.date}</td>
                    <td>{d.files}</td>
                    <td>{bytes(d.bytes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </figure>
      </div>
      <div className="intelligence-ribbon">
        <span className={ai?.available ? "live-dot" : "status-dot"} />
        <div>
          <strong>
            {ai?.available
              ? "Local intelligence is ready."
              : "Your search workspace is ready."}
          </strong>
          <span>
            {ai?.available
              ? `${ai.model} · Generated answers stay on this laptop.`
              : "Cited extractive answers remain available if local generation is offline."}
          </span>
        </div>
        <a href="/workspace/ask">
          Ask a question <ArrowUpRight size={16} />
        </a>
      </div>
    </section>
  );
}
