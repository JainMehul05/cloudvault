import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  MessageSquare,
  ShieldCheck,
  Cloud,
  Files,
  Layers,
  Sun,
  Moon,
  Quote,
  Cpu,
  UploadCloud,
  Check,
} from "lucide-react";
import { api, bytes } from "./api";
import { useTheme } from "./theme";
import Brand from "./Brand";
import productAnswer from "./assets/product-answer.jpg";
type Snapshot = {
  total_files: number;
  total_bytes: number;
  statuses: Record<string, number>;
};
export default function Landing() {
  const [theme, setTheme] = useTheme();
  const [data, setData] = useState<Snapshot | null>(null);
  useEffect(() => {
    document.title = "CloudVault · Your files. A clearer picture.";
    const abort = new AbortController();
    void api<Snapshot>("/analytics", { signal: abort.signal })
      .then(setData)
      .catch(() => {});
    return () => abort.abort();
  }, []);
  return (
    <div className="landing">
      <a className="skip-link" href="#landing-main">
        Skip to content
      </a>
      <header className="landing-nav">
        <a href="/" aria-label="CloudVault home">
          <Brand />
        </a>
        <nav aria-label="Product navigation">
          <a href="#features">Product</a>
          <a href="#how-it-works">How it works</a>
          <a href="#technology">Architecture</a>
          <a href="/workspace/about">About</a>
        </nav>
        <div className="landing-nav-actions">
          <button
            className="icon-button"
            aria-label={`Theme: ${theme}. Change theme`}
            onClick={() =>
              setTheme(
                theme === "light"
                  ? "dark"
                  : theme === "dark"
                    ? "system"
                    : "light",
              )
            }
          >
            {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <a className="primary" href="/workspace">
            Open workspace <ArrowUpRight size={16} />
          </a>
        </div>
      </header>
      <main id="landing-main">
        <section className="landing-hero">
          <div className="hero-editorial">
            <div className="eyebrow">
              <span className="live-dot" /> PRIVATE CLOUD. PERSONAL
              INTELLIGENCE.
            </div>
            <h1>
              Your files.
              <br />A clearer <em>picture.</em>
            </h1>
            <p>
              Keep the original. Find the meaning. Turn scattered documents into
              useful answers—with sources you can open.
            </p>
            <div className="hero-actions">
              <a className="primary" href="/workspace">
                Enter CloudVault <ArrowRight size={18} />
              </a>
              <a className="text-action" href="#product-preview">
                See it in action <ArrowUpRight size={16} />
              </a>
            </div>
            <div className="hero-assurances">
              <span>
                <ShieldCheck size={14} /> Private AWS storage
              </span>
              <span>
                <Cpu size={14} /> Local AI generation
              </span>
              <span>
                <Quote size={14} /> Verifiable sources
              </span>
            </div>
          </div>
          <div
            className="knowledge-composition"
            aria-label="CloudVault workflow"
          >
            <div className="composition-label">
              A LITTLE MORE THAN A FILE CABINET.
            </div>
            <div className="paper-stack">
              <div className="paper-back" />
              <div className="paper-front">
                <span className="paper-icon">
                  <Files size={27} />
                </span>
                <span>THE ORIGINAL</span>
                <h2>Everything in its place.</h2>
                <p>
                  Documents, notes, ideas.
                  <br />
                  Stored privately in Amazon S3.
                </p>
                <div className="paper-lines">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            </div>
            <div className="connection-line" />
            <div className="insight-note">
              <MessageSquare size={21} />
              <div>
                <small>THE CONNECTION</small>
                <strong>Ask across your files.</strong>
                <span>Retrieve evidence. Build understanding.</span>
              </div>
              <span className="note-check">
                <Check size={15} />
              </span>
            </div>
            <div className="composition-bottom">
              <span>01 / STORE</span>
              <span>02 / DISCOVER</span>
              <span>03 / UNDERSTAND</span>
            </div>
          </div>
        </section>
        <section className="live-strip" aria-label="Actual collection snapshot">
          <div>
            <span className="live-dot" />
            <span>
              YOUR COLLECTION, RIGHT NOW
              <small>Read from this workspace · not a product claim</small>
            </span>
          </div>
          <dl>
            <div>
              <dt>Stored files</dt>
              <dd>{data?.total_files ?? "—"}</dd>
            </div>
            <div>
              <dt>Original bytes</dt>
              <dd>{data ? bytes(data.total_bytes) : "—"}</dd>
            </div>
            <div>
              <dt>Indexed documents</dt>
              <dd>{data?.statuses.indexed ?? "—"}</dd>
            </div>
          </dl>
        </section>
        <section className="product-showcase" id="product-preview">
          <div className="landing-section-head">
            <div>
              <span className="eyebrow">THE WORKSPACE</span>
              <h2>
                From “where is it?”
                <br />
                to “now I understand.”
              </h2>
            </div>
            <p>
              Search by meaning. Ask a follow-up. Open the exact passage behind
              an answer. Your evidence is always within reach.
            </p>
          </div>
          <figure className="product-window">
            <div className="window-toolbar">
              <span>
                <i />
                <i />
                <i />
              </span>
              <span>CloudVault / Ask your documents</span>
              <ShieldCheck size={14} />
            </div>
            <img
              src={productAnswer}
              alt="Genuine CloudVault answer combining encryption and network-security documents, with clickable citations and an evidence panel"
              width="1521"
              height="686"
              loading="lazy"
            />
            <figcaption>
              Actual local Qwen response from non-sensitive sample documents.
              Captured during verification; this image is not a live answer.
            </figcaption>
          </figure>
          <a className="text-action" href="/workspace/ask">
            Ask your own question <ArrowRight size={16} />
          </a>
        </section>
        <section className="landing-features" id="features">
          <div className="landing-section-head">
            <div>
              <span className="eyebrow">PURPOSEFULLY CONNECTED</span>
              <h2>
                Less searching.
                <br />
                More finding out.
              </h2>
            </div>
            <p>
              One calm workspace for the complete journey from original file to
              useful insight.
            </p>
          </div>
          <div className="feature-editorial">
            <article className="feature-large">
              <Cloud size={27} />
              <span>01 / A RELIABLE ORIGINAL</span>
              <h3>Your files have a home.</h3>
              <p>
                Private Amazon S3 storage keeps original bytes intact. Organize,
                star, preview and download without losing the source.
              </p>
              <a href="/workspace/files">
                Explore your collection <ArrowUpRight size={16} />
              </a>
              <div className="file-motif" aria-hidden="true">
                <Files size={30} />
                <span>Original file</span>
                <ShieldCheck size={20} />
              </div>
            </article>
            <article>
              <Search size={25} />
              <span>02 / FIND THE IDEA</span>
              <h3>Meaning, beyond a filename.</h3>
              <p>
                Choose semantic, exact, hybrid or filename search. See the
                matching passage and the actual retrieval score.
              </p>
              <a href="/workspace/search">
                Open Smart Search <ArrowUpRight size={16} />
              </a>
            </article>
            <article>
              <Quote size={25} />
              <span>03 / FOLLOW THE EVIDENCE</span>
              <h3>Answers with a way back.</h3>
              <p>
                Local generation connects relevant passages across documents.
                Click a citation and inspect what it really says.
              </p>
              <a href="/workspace/ask">
                Open Ask CloudVault <ArrowUpRight size={16} />
              </a>
            </article>
          </div>
        </section>
        <section className="landing-workflow" id="how-it-works">
          <span className="eyebrow">CLEAR BY DESIGN</span>
          <h2>
            A file goes in.
            <br />
            <em>Understanding</em> comes out.
          </h2>
          <ol>
            {[
              [UploadCloud, "Upload", "Keep your original in private S3."],
              [Layers, "Index", "Extract text and create MiniLM vectors."],
              [
                Search,
                "Retrieve",
                "Find relevant evidence, not just keywords.",
              ],
              [
                MessageSquare,
                "Understand",
                "Generate a local answer with citations.",
              ],
            ].map(([Icon, name, detail], i) => {
              const Symbol = Icon as typeof UploadCloud;
              return (
                <li key={String(name)}>
                  <span className="workflow-number">0{i + 1}</span>
                  <Symbol size={25} />
                  <h3>{String(name)}</h3>
                  <p>{String(detail)}</p>
                </li>
              );
            })}
          </ol>
        </section>
        <section className="landing-technology" id="technology">
          <div>
            <span className="eyebrow">
              CLOUD WHERE IT COUNTS. LOCAL WHERE IT MATTERS.
            </span>
            <h2>
              Built with real tools.
              <br />
              Clear about the boundaries.
            </h2>
            <p>
              Originals live in AWS. MiniLM and Qwen run on this laptop. The
              infrastructure view shows which cloud services have actually been
              verified.
            </p>
            <a className="secondary" href="/workspace/cloud">
              Explore the architecture <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="technology-ledger">
            <div>
              <Cloud />
              <strong>AWS</strong>
              <span>
                Private durable storage
                <br />
                Verified cloud services
              </span>
            </div>
            <div>
              <Cpu />
              <strong>Local AI</strong>
              <span>
                MiniLM · Qwen · Ollama
                <br />
                No hosted AI inference
              </span>
            </div>
            <div>
              <Layers />
              <strong>The workspace</strong>
              <span>
                React · TypeScript · FastAPI
                <br />
                Boto3 · SQLite fallback
              </span>
            </div>
          </div>
        </section>
        <section className="landing-final">
          <span className="eyebrow">YOUR NEXT GOOD QUESTION STARTS HERE.</span>
          <h2>
            Put your knowledge
            <br />
            to <em>work.</em>
          </h2>
          <a className="primary" href="/workspace">
            Open your workspace <ArrowRight size={18} />
          </a>
          <p>
            Single-user local workspace. Existing AWS Free-plan eligibility and
            credits govern cloud use.
          </p>
        </section>
      </main>
      <footer className="landing-footer">
        <Brand />
        <div>
          <a href="/workspace/about">About the project</a>
          <a href="/docs">API documentation</a>
          <a href="https://github.com/HatmanStack/RAGStack-Lambda">
            Upstream &amp; attribution
          </a>
        </div>
        <p>
          CloudVault · Academic project built on RAGStack-Lambda.
          <br />
          No affiliation with the technology providers. Licenses and
          contributions are documented in the project.
        </p>
      </footer>
    </div>
  );
}
