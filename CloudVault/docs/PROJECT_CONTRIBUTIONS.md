# 3.0 contribution boundary

Preserved: upstream source/license/notice, existing S3 originals, v1/v2 checkpoints, file/search workflows, local vectors, MiniLM/Qwen caches and conversations. Implemented here: cloud vector/metadata adapters and migration; conditional outbox; eligible bounded serverless stack and workflow; scoped IAM HTTP API/SSM; actual metrics/job evidence; Free-plan guard; real landing/URL routing/charts/cloud interface; stronger citation checks; expanded retrieval/failure/preservation verification; current handover and lab documentation.

Do not claim ownership of AWS, React, FastAPI, MiniLM, Qwen, Ollama or the upstream project. No invented user/customer data, unsupported benchmark or fake cloud success is used. Original files outside CloudVault remain unchanged against the baseline.


---

## Preserved implementation detail

# Version 2 contributions and attribution

CloudVault 2.0 adds the original Workspace/Explorer/assistant UI and CSS design system, self-hosted Inter (license retained), additive schema migration/FTS, cached hybrid retrieval, local Ollama integration, citation checks, follow-up scope/history, safe raster previews, owned runtime scripts and additional tests/evidence. Lucide and the existing React/FastAPI/SQLite/Boto3/MiniLM dependencies retain their upstream licenses.

Qwen2.5 3B weights are third-party, Qwen research licensed; Ollama is a third-party runtime. Neither is authored by this project. They and all private model/data/runtime caches remain excluded from Git. The original upstream RAGStack source and earlier CloudVault work are preserved and acknowledged below.

---

# CloudVault contributions and attribution

Original foundation: HatmanStack/RAGStack-Lambda, copyright 2024 Christopher Galliart, Apache 2.0. Retain LICENSE and NOTICE when distributing the preserved project or derivative package. NOTICE includes third-party scraping attribution; it remains unchanged even though CloudVault does not use scraping.

| Category | Actual treatment |
|---|---|
| Reused without changes | Upstream source, deployment templates, libraries, scripts, docs and tests remain in the workspace; LICENSE/NOTICE copied verbatim. |
| Adapted conceptually | Document upload, extraction, indexing and original-file retrieval objectives; private AWS storage concepts. |
| Newly implemented | FastAPI REST backend, Boto3 adapter, validated Sydney config, SQLite schema, local CPU MiniLM pipeline, token-aware chunking, NumPy cosine/file aggregation, literal phrase matching and RRF. |
| Newly implemented frontend | React/TypeScript REST client, original CloudVault wordmark/vector treatment, navy/slate workspace, dashboard, drag/drop queue, file manager, smart search, settings and about. |
| Replaced in new runtime | Amplify upload/auth, Cognito, AppSync, DynamoDB metadata, Bedrock inference/knowledge base, Step Functions orchestration. |
| Excluded from new runtime | Chat, web scraping, MCP, media transcription and full-cloud deployment. These upstream components were preserved, not deleted. |
| Reliability and security | Persistent vectors, safe preview, explicit indexing states, retry, protected import, read-only reconciliation, localhost protections, UUID S3 keys, original-byte hash evidence. |
| Validation and handover | Backend/model/API tests, frontend safety/API tests, real S3 verification, screenshots, startup scripts, academic report, demonstration procedure and viva material. |

CloudVault is a distinct simplified implementation alongside an existing open-source foundation, not a claim that the original repository was authored independently. For university submission, acknowledge both upstream work and AI-assisted engineering; follow your institution's authorship and disclosure rules. Student details remain placeholders until supplied.


