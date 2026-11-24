# Limitations and future work

## Current boundaries

- Single-user localhost operation; not production multi-tenant hosting.
- Original bytes are cloud-backed; metadata/search vectors are local and require backups.
- No OCR. Scanned/image-only PDFs are reported empty; images, audio, video and unknown binaries are stored but not content-indexed.
- PDF, DOCX, XLSX and text formats only. Formatting, equations, charts and reading order may be imperfect; extracted text preview is not a pixel-perfect document viewer.
- No logical folders, grid view, dark theme, sharing, collaborative editing or chatbot. These were optional and omitted to protect the core workflow.
- Linear scans of local vectors and extracted text; appropriate for small academic collections rather than millions of chunks.
- Token-aware chunks can cross sentence boundaries. Page references exist for PDF chunks, worksheet names for XLSX; exact full-text results use a content label.
- Queries have a 1,000-character API cap and must also fit the actual model token limit for semantic modes.
- Model identifier/dimension mismatch is detected by excluding incompatible chunks; reindex manually after model configuration changes. A same-identifier upstream weight revision is not a separately versioned index migration.
- Background indexing is not a durable distributed queue. Interrupted work becomes failed and can be retried.
- No atomic transaction spans S3 and SQLite. Reconciliation is read-only and never deletes untracked objects.
- File size 25 MiB default, extracted text 500k characters, PDF 500 pages, spreadsheet 50k rows/sheet, archive expansion 75 MiB, at most 3,000 chunks. Oversized extraction fails visibly rather than claiming partial indexing.
- AWS session and internet are required for cloud upload/download. Keyword search can use the local index without AWS access. Cached semantic inference can run without model-hub connectivity.
- University sample-set retrieval is not a measured benchmark for broad-language accuracy.

## Future improvements

Add local OCR, sandboxed parser worker processes with execution deadlines, durable job tracking, bulk controlled reindex, structured import/recovery, incremental vector caches, authenticated multi-user ownership, managed backups and access-scoped AWS IAM. Provision additional cloud infrastructure only after explicit approval and a cost review.
