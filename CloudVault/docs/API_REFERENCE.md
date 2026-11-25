# Additional 3.0 endpoints

The authoritative schema is live at /docs. All local routes below are under /api.

| Endpoint | Purpose |
|---|---|
| GET /analytics?days=7 or 30 | Actual local file bytes/types/activity/index counts |
| GET /cloud/status | Sanitized provider/service evidence, native metrics snapshot, paused processing and Free-plan guard |
| GET /cloud/jobs | Real bounded DynamoDB job records and history |
| POST /cloud/reconcile | Bounded outbox/job completion; no continuous polling |
| POST /ai/cancel | Cooperative cancellation by request_id |
| GET /files | Cloud metadata with local pending overlay and explicit source |

GET /search and POST /ai/ask now include actual retrieval_backend diagnostics. Free-plan guard failures return explicit fallback or S3 unavailable (503). Existing file/preview/download/search/AI route contracts remain.

Separate cloud HTTP API routes GET /files, /jobs, /status require AWS_IAM. The backend uses SigV4; the browser never receives AWS credentials or signs requests. The endpoint is publicly routable but unauthorized requests return403; throttle1rps/burst2. It is not anonymous public file hosting.


---

## Preserved implementation detail

# Version 2 additions

| Method | Path | Behavior |
|---|---|---|
| GET | /api/ai/status | Actual local model availability and busy state |
| POST | /api/ai/ask | question (2–1500 chars), file_ids (up to 30), optional conversation_id, extractive boolean; generated/extractive/insufficient result with claims, sources, timings |
| GET | /api/ai/conversations | Latest 50 local conversation headers |
| GET | /api/ai/conversations/{id} | Stored scope and completed exchanges |
| DELETE | /api/ai/conversations/{id}?confirm=true | Confirmed local history deletion |
| GET | /api/files/{id}/image | Bounded re-encoded safe raster preview; never active SVG/HTML |

GET /api/files additionally accepts starred and status. PATCH /api/files/{id} accepts optional name and starred. Preview JSON now includes metadata and labeled sections. Ask returns 409 for overlapping generation or scope changes within an existing conversation, 400 for invalid scope and 499 when interrupted. Citation IDs are local to one response; use source.file_id/chunk_id for identity. The existing routes below retain their contracts.

---

# REST API reference

Base: `http://127.0.0.1:8000/api`. Interactive documentation at `/docs`; machine-readable schema at `/openapi.json`. Responses use FastAPI JSON and structured `detail` errors. Validation uses 422, missing resources 404, cloud failures 503, invalid input 400, oversized files 413, and duplicate work 409.

| Method | Path | Behavior |
|---|---|---|
| GET | /health | Process/version/storage/model state |
| GET | /aws/status | Live bucket access, location, public blocks |
| GET | /settings | Non-secret actual configuration |
| GET | /stats | Local managed record counts/bytes/statuses/types/recent files |
| GET | /files | q, extension, sort=name/size/created_at, direction=asc/desc, page, page_size (1–100) |
| POST | /files/upload | Multipart `file`, one file per request, browser queue sends multiple requests; returns 201 once stored, then background indexing |
| GET | /files/{id} | Persisted metadata and indexing state |
| GET | /files/{id}/download | Original S3 bytes as attachment, no-store |
| GET | /files/{id}/preview | JSON escaped-text preview, at most 50,000 characters |
| PATCH | /files/{id} | JSON `{ "name": "new name.txt" }`; stable S3 key |
| DELETE | /files/{id}?confirm=true | Delete owned S3 object and cascade local index; imported original protected |
| POST | /files/{id}/reindex | 202 background extraction and index replacement |
| GET | /search | q (1–1000 chars), mode=semantic/keyword/hybrid/filename, top_k (1–50), threshold (0–1), extension |
| POST | /import-test-object | Explicitly register and index the protected existing cloudvault-test.txt |
| GET | /reconcile | Read-only untracked and missing object report for managed prefix |

## State meanings

`uploading` is an in-flight/uncertain transfer recovery record. `upload_failed` means cloud upload did not return success; check reconciliation before retrying. `pending` and `processing` are indexing stages. `indexed` has searchable vectors. `unsupported` is storage-only. `empty` has no extractable content (scanned PDF needs OCR). `failed` retains a stored original with a visible indexing error.

Upload requests require Content-Length and are rejected above the configured size plus bounded multipart overhead. No permissive CORS headers are provided. Only approved local origins and hosts are accepted. Download is authenticated to S3 by the backend and deliberately uses attachment/octet-stream even for HTML/SVG.

## Example

```powershell
Invoke-RestMethod 'http://127.0.0.1:8000/api/search?q=remotely%20managed&mode=keyword'
```

Result entries contain public file metadata, an actual snippet, section, score, score_kind and optional semantic similarity. Hybrid `score` is an RRF ranking value; it must not be interpreted as a percentage.


