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
