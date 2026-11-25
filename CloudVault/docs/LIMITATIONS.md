# Operational limits

- Single-user localhost lab application; no multi-tenant isolation, public hosting or enterprise SSO. Do not expose ports 8000/11434 publicly.
- AWS event route is paused between bounded rehearsals. Normal uploads still run local extraction and cloud-vector/metadata sync; autonomous cloud stages require the bounded session. No cloud callback to a laptop.
- Account eligibility and credits are time-dependent. A 60-second fail-closed application guard is not a billing cap for AWS resources. No Paid upgrade or own-money authorization exists.
- Full extracted text/conversations remain local; cloud metadata/vector durability is not a complete laptop backup. Keep online SQLite backups and original files.
- Only two explicitly hash-approved non-sensitive fixtures produce plaintext cloud derived artifacts. Other formats are classified for local extraction. Textract/OCR and cloud LLM inference are not enabled.
- Text PDFs, DOCX, text/Markdown/code/CSV/JSON/HTML/XLSX are indexed; scanned PDF/image OCR, audio/video understanding and arbitrary binary extraction are unsupported. Unsupported originals remain downloadable.
- Qwen 3B can omit nuance or make plausible unsupported claims. Exact quote/numeric/relevance checks reduce errors but do not prove entailment. One correction then explicit extractive fallback; small curated tests do not establish universal accuracy.
- Answers summarize retrieved excerpts, not a guaranteed exhaustive reading of every page. Complex comparisons, ambiguous follow-ups, contradictions, languages and adversarial documents need more independent evaluation.
- Fixed evidence/context and upload/chunk limits protect resources. Large corpora need different indexing/query strategies. Cloud pagination is bounded; no million-document scaling claim.
- Safe plain-text claim rendering is used instead of arbitrary model HTML/Markdown. Rich generated tables/code layouts and streaming tokens are not implemented; source-grounded paragraphs and citations remain functional.
- Real logs/native metrics are timestamped snapshots and can lag. Missing data is unavailable. Negative-test errors are retained. No formal accessibility certification, security audit or billing reconciliation is claimed.
- Browser automation file/download controls remain enabled. The restored fixture used the normal multipart API; normal browser download was user-confirmed.
