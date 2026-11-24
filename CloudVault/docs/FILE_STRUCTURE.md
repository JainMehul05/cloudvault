# File structure

| Path | Responsibility |
|---|---|
| backend/app/main.py | Storage APIs, safe previews and frontend serving |
| backend/app/storage.py | Real Boto3 S3 adapter, diagnostics |
| backend/app/database.py | Additive schema migration, SQLite and FTS |
| backend/app/embeddings.py | Token-aware chunks and MiniLM vectors |
| backend/app/search.py | Existing four search modes |
| backend/app/retrieval.py | Cached dense/FTS hybrid evidence and diversity |
| backend/app/llm.py | Loopback structured Qwen inference |
| backend/app/rag.py | Scope, follow-ups, citation checks, cancellation, local history |
| frontend/src/Workspace.tsx | Shell, overview, preferences, command palette |
| frontend/src/FileExplorer.tsx | List/grid, sorting/filtering, stars and selection |
| frontend/src/DocumentPreview.tsx | Safe source/metadata preview and original download |
| frontend/src/AskCloudVault.tsx | Assistant, sources, follow-ups and history |
| frontend/src/SmartSearch.tsx | Filename/exact/semantic/hybrid search |
| frontend/src/Upload.tsx | Persistent measured upload/indexing queue |
| frontend/src/design.css | Responsive light/dark tokens and reduced motion |
| scripts/setup-ai.ps1 / start-ai.ps1 | Optional verified runtime/model setup and loopback startup |
| scripts/warmup.ps1 / stop-ai.ps1 | Warmup and owned runtime shutdown |
| scripts/benchmark.py | Repeatable read-only latency evidence |
| docs/history/v1 | Preserved earlier reports |
| screenshots/v2 | Genuine UI verification captures |

Private data, models, credentials, logs, runtime binaries and database backups are excluded from Git. Original upstream files outside CloudVault remain preserved.

