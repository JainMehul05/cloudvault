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
