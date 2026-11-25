# 3.0 security boundaries

AWS Free-plan checks fail closed; no upgrade/payment operation exists. The backend alone holds temporary credentials. Every cloud HTTP route requires AWS_IAM and conservative throttling. Original S3 public blocking is preserved; UUID keys and ownership checks protect file operations. No document content, credentials or answer prompts are logged by the worker.

Scoped worker/workflow roles, exact event bucket/prefix, derived-prefix exclusion, ETag checks, finite retries, DLQ and stable execution IDs limit event abuse. Event route/consumer are disabled outside bounded rehearsals. Logs retain three days; no scheduled processing or custom metrics. Only two approved fixture hashes allow plaintext derived cloud artifacts. Vectors/metadata are private but still sensitive representations; do not publish them.

Qwen/MiniLM/full text/history stay local; cloud query metadata is validated against current local chunks. Untrusted evidence cannot invoke tools or expose credentials. Structured exact quote/relevance/numeric checks and one bounded correction reduce unsupported claims; this is not formal entailment proof. Plain-text rendering avoids arbitrary model HTML. Existing filename/path/upload/preview protections remain below.

No public hosting, multi-tenant authorization, independent penetration test, formal WCAG certification or universal prompt-injection guarantee is claimed. Dependency snapshots remain in NPM_AUDIT_V2.json/PYTHON_AUDIT_V2.json; the GPU Torch +cpu/version matching caveat is an audit-tool limitation, not evidence of zero vulnerabilities. No new v3 dependency/model was installed.


---

## Preserved implementation detail

# Version 2 security additions

Generation is restricted in configuration to the approved loopback URL/model, with HTTP proxy environment use disabled. Ollama is started on loopback with cloud features disabled. Document passages are untrusted data, never executable tools; the model receives no AWS credentials. Structured output and server-side ID/exact-quote validation reduce fabricated citations. Generated text is escaped React text, not raw HTML. These controls do not prove semantic entailment or eliminate prompt injection.

Safe raster thumbnails allow only JPEG/PNG/WebP/GIF, cap decoded pixels and re-encode a bounded JPEG. Uploaded SVG/HTML remains inert/download-only. Conversation history and retrieved excerpts are private local SQLite data and should be included in the local backup/privacy policy. One generation is allowed at a time with bounded context and timeout. Baseline host/origin/cross-site protections remain.

Python audit found no known vulnerabilities in audited dependencies; the CPU-specific torch build was skipped because the audit could not resolve it on PyPI. See PYTHON_AUDIT_V2.json. This is a point-in-time audit, not a security guarantee.

---

# Security model

This is a local, trusted, single-user academic application. The supplied startup binds to 127.0.0.1. No authentication is pretended: another local process/user on this computer can use the API. Do not bind to 0.0.0.0, forward the port, or publish it without adding authentication, authorization, TLS, rate limits and parser isolation.

## Implemented protections

- Boto3's supported credential chain and the existing AWS profile; no permanent keys, tokens or credentials in browser code.
- Existing private bucket; all four public-access-block flags inspected. No ACL/policy/IAM changes.
- UUID object keys under a dedicated prefix, conditional creation, AES256 server-side encryption.
- Imported original `cloudvault-test.txt` has `owned=0`; backend deletion is rejected.
- Host allowlist, origin allowlist, cross-site fetch rejection and no wildcard CORS.
- 25 MiB per-file default; bounded multipart request size with Content-Length requirement; maximum extraction/chunk/page/worksheet limits.
- DOCX/XLSX decompression-size and archive-entry checks; no arbitrary archive extraction to disk.
- Filename basename normalization, control-character removal, length bounds and encoded attachment names.
- Download-only original delivery with nosniff; uploaded HTML/SVG never becomes trusted active preview.
- Plain-text previews and escaped React snippets; no uploaded content execution or HTML injection.
- Pydantic validation, parameterized SQL, SQL sort allowlists, foreign keys and transaction boundaries.
- Sanitized cloud/database errors; no credential logging. Local database, environments, caches and logs ignored by Git.
- Deletion requires an explicit API confirm flag and a browser confirmation dialog.

## Residual risks

Parser limits bound common decompression and large-text cases, but CPU/memory exhaustion from adversarial PDFs is not fully isolated. Background processing runs in the backend thread pool and can be interrupted. Cross-system S3/SQLite mutations can be partially complete. Loopback security assumes a trusted machine. Current AWS profile permissions may exceed this app's needs; no automatic IAM modification was made. Audit your local machine and use only non-sensitive fixtures for public demonstrations.

Swagger documentation loads its static UI from jsDelivr with a route-specific CSP allowance; the actual application build uses local assets and a stricter policy. Model download requires Hugging Face access once; cached CPU inference needs no paid AI service.


