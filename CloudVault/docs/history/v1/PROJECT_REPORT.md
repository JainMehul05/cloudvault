# CloudVault — AWS-Based Intelligent Cloud File Storage System with Semantic Search

Student: [Name]  
Roll number: [Roll number]  
Department: [Department]  
University: [University]  
Evaluation date: [Date]

## Abstract

CloudVault combines genuine private Amazon S3 object storage with local document intelligence. Users upload originals through a React interface, while a FastAPI service stores their bytes in an existing Sydney bucket and persists metadata in SQLite. Supported document contents are extracted, split into overlapping token-aware chunks and encoded with a CPU-based all-MiniLM-L6-v2 model. NumPy cosine similarity supports natural-language retrieval, literal matching provides exact phrase search, and reciprocal rank fusion combines the two rankings. This hybrid design avoids a restricted Bedrock dependency and unnecessary cloud provisioning while retaining actual cloud storage. Eight original non-sensitive sample files were uploaded through the website, their S3/API bytes verified, and five predefined semantic queries retrieved their expected documents at rank one. Evidence and limits are recorded in the test report.

## 1. Introduction

Cloud file storage improves remote availability and separates application storage from one physical device. However, filename-based discovery often depends on remembering arbitrary names. Intelligent information retrieval can improve discovery by searching document meaning as well as literal contents. CloudVault makes both capabilities visible in an understandable university-scale application.

## 2. Problem statement

The downloaded RAGStack-Lambda foundation is a capable multi-service AWS document platform. Its Cognito/AppSync/Bedrock/S3 Vectors/Step Functions integrations require a complete deployment and service permissions beyond the available lab account. Model invocation was reported restricted, while real S3 upload was available. Merely rebranding that frontend or changing its region would not create a functional standalone system. A coherent smaller architecture was needed.

## 3. Objectives and scope

Store originals in the existing private S3 bucket; retain secure SDK authentication; index supported actual contents with genuine local ML vectors; offer semantic, exact, hybrid and filename retrieval; return original downloadable files; persist the index; provide clear errors and a polished local UI; preserve upstream attribution; minimize cloud cost. Public hosting, collaboration, OCR and media transcription are outside the implemented scope.

## 4. Existing system overview

The original repository contains React/Cloudscape, Amplify, Cognito, AppSync, Lambda, S3, DynamoDB, Bedrock knowledge bases, S3 Vectors, event-driven processing, media workflows, scraping and MCP components. Its templates configure Nova multimodal embeddings and document us-east-1 availability. Multiple retention policies may leave resources after stack deletion. These source findings are distinguished from runtime verification in SOURCE_AUDIT.md. The original source was preserved with a Git checkpoint and retained notices.

## 5. Proposed system

A hybrid local-cloud application uses only existing Amazon S3 for authoritative originals. A local Python service handles upload validation, metadata, extraction, inference and retrieval. The browser consumes a REST API. SQLite holds persistent text/vectors and provenance; the CPU model avoids a paid AI API. ARCHITECTURE.md includes system, cloud and upload diagrams; DATABASE.md documents the relationship model.

## 6. System requirements

Windows 11, Node.js 24, npm, uv-managed Python 3.13, Git, AWS CLI with an authenticated default profile, and internet access for S3. The validated environment uses CPU Torch, current Boto3 with CRT, FastAPI, NumPy, Sentence Transformers, PyPDF, python-docx and openpyxl. Python 3.13 worked; a fallback 3.12 installation was unnecessary. Docker and SAM are not required for this new runtime. Initial dependencies/model need disk space and network; exact validated versions are locked.

## 7. Architecture and design

The browser displays Dashboard, My Files, Upload, Smart Search, Settings and About Project. Shared components handle statuses, safe highlights and native accessible dialogs. An isolated Boto3 adapter centralizes cloud access. The metadata layer uses short transactional connections. Processing serializes local model inference and deletion with a lock to avoid resurrecting removed index data. One Uvicorn server can serve the production React bundle and API from loopback, simplifying the demo.

## 8. AWS cloud implementation

The existing bucket `cloudvault-d0c2b49b4347` is accessed only in ap-southeast-2. Temporary profile credentials resolve through the official provider chain. UUID keys under `cloudvault/files/` avoid overwrites; conditional puts and AES256 encryption are used without public ACLs. Download reads the exact original through the backend. Diagnostics inspect bucket access, region and public-access blocks. No account upgrade or new infrastructure was provisioned. Eight agent-created demo keys are recorded explicitly; existing and user-added objects were preserved.

## 9. AI and retrieval implementation

The model produces genuine 384-dimensional float32 vectors. Text chunks use tokenizer offsets, 220-token windows and 32-token overlap with explicit length validation. Normalized embeddings persist in SQLite. A natural-language query is encoded by the same model, and NumPy dot products compute cosine similarities. Maximum chunk relevance aggregates results per original file. Configurable thresholds and top-K control breadth. Exact search matches complete casefolded text and provides actual snippets. Hybrid search sums 1/(60+rank) across separately ranked semantic/literal results. It does not add incompatible raw scores. SEMANTIC_SEARCH.md gives the algorithm and measured examples.

## 10. Backend implementation

FastAPI validates uploads, search controls and rename payloads; maps cloud failures to actionable errors; provides pagination, safe metadata, previews, downloads, reindex and read-only reconciliation. Background indexing separates confirmed storage from processing success. Unsupported/empty/corrupt files receive distinct states. Stored originals are retained when extraction or model inference fails. SQL uses bound values and enum-controlled sort fields. API_REFERENCE.md documents routes and error codes.

## 11. Frontend implementation

The original navy/slate identity uses an original vector wordmark treatment, restrained blue accents, reusable file/status components and responsive layouts. Dashboard counts use actual API data and explain their scope. Upload supports multiple files, drag/drop, size checks, progress, per-file errors and retry. Smart Search displays measured scores, safe snippets, modes and download actions. File management includes filtering, sorting, preview, rename and irreversible-delete confirmation. Settings contains actual diagnostics and non-secret configuration. The About page explains the real architecture and attribution.

## 12. Database design

Files carry original/display names, UUID, unique S3 key, size, type, timestamps, SHA256 hash, ownership, extraction status, full text and chunk count. Chunks carry file foreign keys, text, section, model identifier, dimension and vector bytes. A file has many chunks; cascade deletion avoids orphans. WAL and transactional index replacement preserve consistency across restart. Local backups are necessary because S3 originals alone do not preserve all application metadata.

## 13. Security

The service is explicitly single-user and binds to loopback. Approved local origins and hosts are enforced; cross-site mutations are rejected. Private S3 access, supported temporary credentials, safe filename normalization, UUID keys, extraction limits, archive expansion checks, inert previews, nosniff downloads, parameterized SQL and ignored private runtime files reduce common risks. This is not hardened multi-tenant software: hostile parser isolation, authentication and public-service protection remain future work. SECURITY.md describes the threat model and residual risks.

## 14. Testing and results

Automated backend tests exercise actual model shape, normalization, chunk limits, semantic versus unrelated text, extraction formats, CRUD, persistence, storage failures, validation, model incompatibility and safe deletion using isolated storage. Frontend tests verify safe snippet rendering and real API error propagation. Static checks include TypeScript production build, ESLint, Ruff and dependency compatibility/audit. Real AWS verification compares sample bytes and SHA256 values through S3 GET and the API, checks AES256 metadata, and repeats semantic/exact/hybrid retrieval after restart. Browser checks cover actual multi-file upload, search, preview, filters, rename and responsive sizes. TEST_REPORT.md is the authority for final counts, failures and verification limits.

The five predefined semantic cases all ranked the expected file first: storage 0.359640, security 0.394551, machine learning 0.566055, databases 0.549624 and renewable energy 0.521818. This small original dataset demonstrates functionality, not general retrieval accuracy. Browser attachment handling must be assessed separately from verified backend byte retrieval; no failed browser action should be represented as passed.

## 15. Advantages

Genuine cloud originals with low operational complexity; free local AI inference; persistent explainable retrieval; exact phrase support; one-command local startup; distinct storage/index status; visible failures; no unnecessary cloud service provisioning; clear attribution and student-readable modules.

## 16. Limitations

Single-user localhost scope; local metadata backup responsibility; no OCR or media content search; finite extraction limits; linear vector scanning; in-process background jobs; non-atomic S3/SQLite boundary; imperfect extraction of complex layouts; similarity scores do not guarantee relevance. LIMITATIONS.md lists detailed constraints and unverified cases.

## 17. Future enhancements

Local OCR, isolated parser workers, durable indexing queues, authenticated multi-user ownership, incremental indexing, controlled import/recovery, managed backups, richer document preview and carefully costed optional cloud deployment. Additional services or account permission changes require explicit approval.

## 18. Conclusion

CloudVault demonstrates a working hybrid approach: actual S3 originals and secure cloud API access combined with locally persisted semantic and exact retrieval. Its central workflow was implemented and tested using real storage and real ML vectors. Remaining operational and browser verification limits are stated explicitly so the evaluation can distinguish evidence from assumptions.

## 19. References and attribution

- [HatmanStack RAGStack-Lambda foundation](https://github.com/HatmanStack/RAGStack-Lambda); retained LICENSE and NOTICE.
- [Boto3 credential provider documentation](https://docs.aws.amazon.com/boto3/latest/guide/credentials.html).
- [Sentence Transformers API](https://www.sbert.net/docs/package_reference/sentence_transformer/SentenceTransformer.html).
- Local source, SOURCE_AUDIT.md, ARCHITECTURE.md, DATABASE.md, SECURITY.md and raw LIVE_VERIFICATION reports.

The upstream foundation and AI-assisted CloudVault modifications must be disclosed accurately in the final academic submission. No personal or institutional details have been fabricated.
