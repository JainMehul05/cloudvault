# Cloud failure and recovery

| Condition | Behavior | Recovery |
|---|---|---|
| Free-plan state unverified, Paid, expired or credit reserve reached | Cloud guard fails closed; dense/metadata fall back locally, S3 operation returns 503 | Verify Free-plan status and existing credits. Never upgrade as a repair. Recheck after the short cache expires. |
| Temporary credentials expire | Cloud calls fail, local content/search remain | Run `aws login --profile default` yourself; retry. No root/permanent key required. |
| Cloud vectors unavailable or new vector write pending | Explicit local dense fallback; existing normalized vectors retained | Restore connectivity; bounded metadata/job reconciliation. Do not download models again. |
| Metadata write fails | Durable SQLite outbox retains revision; local overlay prevents disappearing edits | Startup flushes once (bounded); Cloud Infrastructure → Sync waiting jobs retries a bounded batch. |
| Duplicate/stale event | Stable execution name deduplicates; object ETag validation rejects stale revisions | Inspect job history; do not replay every object blindly. |
| Model unavailable or invalid generated citations | Clearly labeled extractive response; one bounded correction at most | Start/warm local Ollama; review exact supporting quotes. No paid API fallback. |
| No relevant evidence | Explicit insufficient-evidence answer | Ask a more specific question or index relevant documents. |
| Laptop offline | Cloud workflow stops at awaiting-local; AWS cannot call localhost | Start the app; one bounded resume or Sync waiting jobs completes known indexed files outbound. |
| Worker error | Partial SQS failure response, finite retries/DLQ; workflow Catch records failure | Inspect retained job and safe logs, correct cause, reconcile only the affected file. |
| Event pipeline paused | New normal uploads still index locally and sync cloud vectors/metadata; no autonomous cloud-stage run | For a deliberate non-sensitive rehearsal use the bounded verification command below, which pauses again in finally. |

Normal startup: `./scripts/start.ps1`, optionally `./scripts/warmup.ps1`. No automatic model download is needed. `/api/cloud/status` exposes sanitized guard/provider/evidence state; `/api/cloud/jobs` shows job progress; `/api/cloud/reconcile` is bounded. Runtime manifests and before-notification snapshot are private in `.runtime`.

For a new deliberately created canary, after verifying current FREE credits, `backend/.venv/Scripts/python.exe scripts/verify-cloud-workflow.py` runs a bounded actual rehearsal and pauses triggers in finally. It creates another canary original, so do not run it merely to view existing evidence. To resume an **existing** approved fixture without duplicating its original, preview `scripts/reconcile-one-file.py <file-id>` and use `--apply` only for the intended file. Never reconcile unrelated documents as a cleanup shortcut.

Cloud metadata is durable but not a complete cloud backup of extracted text or conversations. Rebuilding a lost laptop index requires originals and the existing model. SQLite online backups under `data/backups` and source checkpoints are preserved. Do not copy a live WAL database by copying only its main file.
