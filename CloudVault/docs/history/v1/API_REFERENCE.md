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
