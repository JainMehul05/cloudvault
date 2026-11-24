# File structure

| Path | Responsibility |
|---|---|
| backend/app/main.py | REST routes, local request protections, safe download/preview, production frontend serving |
| backend/app/config.py | Validated environment configuration, fixed Sydney region |
| backend/app/storage.py | Dedicated real Boto3 S3 adapter and diagnostics |
| backend/app/database.py | SQLite schema, connections, recovery, public metadata |
| backend/app/extractor.py | Bounded text, PDF, DOCX, XLSX and inert HTML extraction |
| backend/app/embeddings.py | Single CPU model, token-aware chunks, normalized vectors |
| backend/app/services.py | Persistent document indexing state machine |
| backend/app/search.py | Literal matching, cosine similarity, file aggregation, RRF |
| backend/app/security.py | Unicode filename sanitization and path removal |
| backend/tests/test_core.py | Real-model and isolated storage/API tests |
| backend/requirements.lock | Exact validated Python environment |
| frontend/src/App.tsx | Layout, navigation, dashboard, settings and about |
| frontend/src/FileManager.tsx | Listing, sorting, filtering, preview, rename, confirmed deletion |
| frontend/src/Upload.tsx | Multi-file queue, drag/drop, measured transfer progress |
| frontend/src/SmartSearch.tsx | Search modes, controls, real snippets and downloads |
| frontend/src/components.tsx | Reusable status, safe highlight, dialog and empty state |
| frontend/src/api.ts | Typed REST client, bounded request timeout, upload transport |
| frontend/src/styles.css | Original navy/slate responsive design |
| frontend/src/core.test.tsx | Safe rendering and API error tests |
| scripts/setup.ps1 | Recreate dependencies, build, model and AWS checks |
| scripts/start.ps1 / stop.ps1 | Owned-process launch/stop with health and identity checks |
| scripts/create_samples.py | Reproducible original non-sensitive TXT/Markdown fixtures |
| scripts/verify_live.py | Read-only real S3 byte/ranking verification |
| samples/ | Original content plus predefined expected semantic queries |
| docs/ | Architecture, evidence, academic report and evaluation material |
| screenshots/ | Genuine screenshots of the running browser |
| data/ (ignored) | Private persistent SQLite and downloaded model cache |
| .runtime/ (ignored) | Process identity and local logs |

All upstream directories at the workspace root remain accessible. Git's initial commit preserves the pre-CloudVault tree.
