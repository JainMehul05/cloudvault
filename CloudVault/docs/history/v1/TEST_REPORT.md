# Test report — 24 November 2026

## Readiness assessment

The core lab workflow is working: website upload → real private Sydney S3 → supported text extraction → real 384-D local embeddings → persistent SQLite → semantic/exact/hybrid retrieval → original-byte download. The user separately confirmed that Download original saves successfully in their normal browser. This is a verified single-user local demonstration, not a claim of production readiness or 100% feature coverage.

## Backend automated checks

**24 passed**, final run completed in **34.87 seconds** using Python 3.13.18 and real CPU MiniLM inference. Storage mutation tests use an explicitly isolated in-memory adapter and temporary SQLite; they are not represented as real AWS tests.

Coverage includes region/prefix validation, path-safe Unicode names, supported text formats, safe HTML extraction, DOCX paragraphs/tables, XLSX cells, empty/scanned-style PDF, encrypted/corrupt PDF, oversized ZIP expansion, unsupported binary, invalid JSON, model dimension and normalization, semantic ordering, chunk token bounds, upload/download hashes, metadata persistence, exact/semantic/hybrid/filename retrieval, file aggregation, no-results, rename, confirmed deletion/cascade, duplicate filenames, pagination, input/query/size validation, origin/host protections, cross-site mutation rejection, AWS access denial, missing originals, failed upload states, model failure retaining originals, incompatible vectors, protected test-object import, reindex and S3 write safeguards.

Command: `backend/.venv/Scripts/python.exe -m pytest -q` from backend.

## Frontend automated checks

**8 passed** in Vitest 5.1.1. Tests cover escaping uploaded HTML in snippets, literal case-insensitive phrase highlighting, no-match behavior, unsupported status display, measured-byte formatting, valid REST data, propagated AWS errors and non-JSON server error handling. These are component/API unit checks; browser workflows are listed separately below.

## Static and compatibility checks

| Check | Observed result |
|---|---|
| TypeScript check and production build | Passed; Vite 7.3.8, React production assets generated |
| ESLint src | Passed |
| Ruff app/tests | Passed after formatting fixes |
| Python compileall app | Passed |
| uv pip check | All 74 installed Python packages compatible |
| npm audit | 0 known vulnerabilities in final installed tree |
| Python 3.13 CPU compatibility | Successful; no Python 3.12 fallback needed |
| Actual model output | (1, 384), normalized float vectors |
| Dependency reproducibility | Exact Python requirements.lock and npm package-lock.json retained |

The initial older Vitest dependency had reported security issues and was upgraded. Ruff initially found formatting violations; code was formatted and affected checks rerun. No failing tests were removed to obtain a pass. A full vulnerability audit of every Python transitive package was not performed; compatibility is not a vulnerability guarantee.

## Actual AWS integration checks

CLI STS identity succeeded. Boto3 with CRT resolved the existing browser-login credentials. Bucket location was ap-southeast-2, and all four public-access-block flags were true. No policy, permission, region, account-plan or infrastructure changes were made.

Eight original non-sensitive samples were uploaded through the actual browser UI in two queue batches. They total **2,309 bytes**. For every one, independent S3 HEAD confirmed length and AES256 encryption; S3 GET and the REST download returned bytes identical to the source sample and its SHA256 hash. Exact UUID keys, hashes and observations are in LIVE_VERIFICATION.json. Objects were retained for evaluation. No real cloud deletion was performed.

Read-only reconciliation reported **0 untracked managed objects and 0 missing originals** at verification. The existing root cloudvault-test.txt was untouched. Additional user-added objects observed while work was underway were preserved and are not claimed as agent-created fixtures.

## Semantic retrieval checks

Expected files were specified in samples/expected_queries.json before live verification. Among the original eight-document collection:

| Query topic | Expected original | Observed rank | Cosine similarity |
|---|---|---:|---:|
| Remote digital file storage | object-storage.txt | 1 | 0.359640 |
| Protect information from hackers | network-security.txt | 1 | 0.394551 |
| Computers learn from examples | machine-learning.txt | 1 | 0.566055 |
| Store/retrieve structured information | databases.txt | 1 | 0.549624 |
| Environmentally friendly energy | renewable-energy.txt | 1 | 0.521818 |

The exact query wording was absent from relevant sample contents. No matches or scores are hardcoded. Exact `remotely managed` returned object-storage.txt with one literal occurrence; hybrid returned the same original using computed RRF. A nonexistent exact phrase returned zero results. This is a small functionality demonstration, not broad accuracy benchmarking.

## Restart and Windows scripts

The owned server was stopped and started with stop.ps1/start.ps1. Metadata, chunks, original IDs and results persisted. LIVE_VERIFICATION_RESTART.json records independent repeated S3 byte checks and all five rank-one retrieval cases after restart, including unrelated user-added documents present by then. Cached model loading succeeded without regenerating document embeddings.

The first stop check exposed PowerShell's automatic JSON date conversion: string comparison incorrectly considered the PID reused. It was fixed by comparing UTC ticks. Stop/start then succeeded while preserving data. Start called again recognized the existing server without launching a duplicate. Setup installs exact dependencies, builds the frontend, initializes the database, loads the model and checks S3; its final result is recorded in FINAL_HANDOVER.md.

## Browser checks

Actual Brave browser automation exercised Dashboard, Upload, My Files, Smart Search and Settings. It verified multi-file queue selection/upload, indexed state, measured counts, semantic retrieval, exact phrase highlighting, safe preview, filename filtering, action menus, display-name rename and restoration, and delete-dialog cancellation. Existing About content and navigation are implemented and statically reviewed; not every About link or keyboard combination was exhaustively automated.

Responsive checks used requested viewport overrides 390×844 and 768×1024. Measured layout widths were 375 and 753 CSS pixels after scrollbars, and scrollWidth equaled clientWidth in both tested dashboard/search layouts: no page-level horizontal overflow. Overrides were reset. Genuine screenshots are under screenshots/.

The extension's file-chooser setFiles API was restricted by its file-URL permission. The standard Windows picker was used successfully without changing permissions. Automated attachment navigation later hit Brave ERR_BLOCKED_BY_CLIENT and a download-event timeout; it was not recorded as an automated browser pass. The backend independently proved exact bytes, and **the user explicitly confirmed normal-browser Download original saves successfully**. Standard download attributes were also added to links. Browser error-log inspection returned no captured app warnings/errors in the checked tab; this does not prove every browser/session is error-free.

## Skipped, restricted and unverified cases

- Real AWS deletion deliberately not executed; isolated API deletion/cascade tests passed, browser confirmation/cancel passed.
- Expired credentials/internet loss were not induced against the live account; SDK errors are simulated and handled in isolated tests.
- No hostile-PDF CPU stress test, large production load test, full screen-reader audit or exhaustive browser matrix.
- No complete upstream cloud deployment test or Bedrock invocation; both are outside the new runtime.
- No paid billing balance check or future-cost guarantee.
- Optional OCR, folders, grid view, multi-user auth, theme and public deployment were not implemented.

## Evidence files

LIVE_VERIFICATION.json, LIVE_VERIFICATION_RESTART.json, backend/tests/test_core.py, frontend/src/core.test.tsx, screenshots/semantic-search.jpg, keyword-search.jpg, dashboard.jpg, mobile-dashboard.jpg, mobile-search.jpg and tablet-search.jpg. Keep private runtime data out of public repositories.
