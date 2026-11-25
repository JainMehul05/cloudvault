# CloudVault 2.0 handover

CloudVault now combines the preserved private AWS file workflow with a new responsive product interface and genuine private local RAG. Open http://127.0.0.1:8000 after running ./scripts/start.ps1 from the CloudVault directory. Run ./scripts/warmup.ps1 before a demonstration. API docs: http://127.0.0.1:8000/docs.

## Delivered product

| Area | Result |
|---|---|
| Baseline | v1 tag cloudvault-v1-baseline; 24 backend/8 frontend checks established before changes; private online backup |
| Architecture | Existing S3 originals + local FastAPI/SQLite/MiniLM preserved; loopback Qwen added |
| Libraries | Only @fontsource-variable/inter added to frontend for private self-hosted typography; existing Lucide/React retained; Pillow added for safe bounded raster previews |
| Design system | Original light/dark/system ink/slate tokens, readable hierarchy, responsive sidebar, command palette |
| Overview | Actual collection/index/type summaries, recent files and working quick actions |
| Files | List/grid/density preferences, filters/sorting, stars, page selection, scoped Ask, safe previews, rename/reindex/confirmed delete |
| Upload | Deduplicated queue remains mounted across navigation; measured transfer progress and actual indexing status |
| Search | All four existing modes retained, local recent queries, scoped Ask from results |
| Assistant | Multi-file generation, atomic citations, source panel/preview/download, fixed file scope, follow-ups, local history, copy/regenerate/Stop |
| Interaction | Native dialogs, focus restoration, background scroll lock, visible keyboard focus, reduced-motion handling, jump-to-latest behavior |
| Accessibility | Skip link, labels, keyboard shortcuts, modal focus behavior and responsive control wrapping; no formal WCAG certification |
| Security | Loopback-only AI, no model tools/credentials, untrusted evidence, structured output and citation/quote/relevance checks |
| Persistence | Additive schema v2, FTS triggers, stars/conversations/exchanges; old vectors retained |
| Local model | qwen2.5:3b Q4_K_M, 1.9 GB weights, Qwen research license; official portable Ollama with SHA verification |
| Actual hardware | i5-13420H, 16 GB RAM, RTX 4050 6,141 MiB; actual inference reports 100% GPU and about 2.3 GB resident |
| Performance | Final validated warm multi-file/follow-up requests 2.285/2.234 seconds; first cold run 141.963 seconds; see measured reports |
| Regression | 34 backend and 10 frontend tests; TypeScript/build/ESLint/Ruff passed |
| Real AWS | Nine fixture originals compared across local/S3/API bytes; five original semantic cases rank first; public blocking retained |
| Local AI evidence | Actual generation, follow-up, scoped answer, abstention, fallback, injection fixture and cancellation recorded |
| Browser evidence | Generated answer and clicked citation, themes/pages, narrow layouts and source previews captured genuinely |

## Evidence and technical documents

- [RAG architecture](RAG_ARCHITECTURE.md), [local AI setup](LOCAL_AI_SETUP.md), [database](DATABASE.md), [API](API_REFERENCE.md).
- [Design system](DESIGN_SYSTEM.md), [file structure](FILE_STRUCTURE.md), [security](SECURITY.md).
- [Tests](TEST_REPORT.md), [performance](PERFORMANCE_REPORT.md), [search evaluation](SEARCH_EVALUATION.md), [final review](FINAL_QUALITY_AUDIT.md).
- Raw evidence: AWS_VERIFICATION_V2.json, LOCAL_AI_INTEGRATION.json, BENCHMARK_BASELINE.json, BENCHMARK_V2.json, BENCHMARK_FINAL.json, NPM_AUDIT_V2.json, PYTHON_AUDIT_V2.json.
- Genuine screenshots: ../screenshots/v2/generated-answer-dark.jpg, generated-citation-dark.jpg, overview-light.jpg, overview-dark.jpg and files-mobile.jpg.
- [Evaluation guide](EVALUATION_GUIDE.md), [project report](PROJECT_REPORT.md), [78 viva questions](VIVA_QUESTIONS.md), [contributions](PROJECT_CONTRIBUTIONS.md).

## Startup and ownership

Use PowerShell in C:/Users/hp/Downloads/RAGStack-Lambda-main/CloudVault:

```powershell
./scripts/start.ps1
./scripts/warmup.ps1
```

Only if reconstructing the optional generation installation: ./scripts/setup-ai.ps1. Existing normal setup remains ./scripts/setup.ps1. Stop the app with ./scripts/stop.ps1; stop the separately owned runtime with ./scripts/stop-ai.ps1. Both preserve files and indexes and check ownership before stopping a process.

No paid AI API or additional AWS service was introduced. S3 usage still follows the existing account's charges/credits. Private model weights, runtime binaries, credentials, database and backups are excluded from Git.

## Practical limits

No OCR, token streaming, exhaustive whole-document summaries, cross-encoder reranker or public multi-user deployment. Answers use selected passages. Exact citations and relevance checks cannot prove semantic entailment. Initial model loading can be slow, and memory contention can change latency. The browser's extension blocked automated file selection, so the fresh fixture used the real API; actual browser upload had been verified in the preserved v1 baseline. See LIMITATIONS.md for further operational boundaries.

