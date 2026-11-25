# CloudVault 3.0 project report

CloudVault is a private intelligent file workspace built by extending an existing AWS project rather than discarding it. Original repository LICENSE/NOTICE and baseline source remain. The contribution separates durable cloud services from resource-heavy local inference, demonstrating both real AWS architecture and grounded AI on a student laptop.

The React/TypeScript product provides an original landing page, light/dark dashboard, file management, four search modes, upload progress, safe preview, stars, command palette and cited assistant. Native SVG charts use actual stored sizes/timestamps. The Cloud Infrastructure page exposes recorded operational evidence rather than decorative AWS logos.

Actual AWS integration includes existing private S3, S3 Vectors, DynamoDB, a scoped Lambda, SQS/DLQ, EventBridge, Standard Step Functions, CloudWatch, IAM HTTP API, Standard SSM and CloudFormation. The native event path has been exercised. The workflow records a durable cloud stage and awaits outbound local embedding completion. It never claims a cloud service can call localhost.

MiniLM produces 384D embeddings locally; live cloud cosine queries combine with local BM25 through RRF and diversity gates. Qwen2.5 3B Q4_K_M runs on the RTX4050 and produces structured claims from retrieved passages. Exact quotes, real source IDs, relevance/numeric checks, one correction and explicit abstention/fallback support trustworthy inspection. These safeguards are not formal proof of factual correctness.

Verification: 46 backend/12 frontend tests, production build/lints, actual cloud operations and model answers. Ten curated retrieval cases rank first; contradictory policies remain separately cited. Preservation verifies10 unaffected originals/59 original vectors and prior conversations. User-requested water restoration used normal app upload and real SQS reconciliation with byte/rank/generated-answer proof.

The account remained FREE/ACTIVE with US$140 eligible credits at final check. No Paid upgrade, paid AI API or unnecessary infrastructure was used. Event processing is paused; retained resources can consume credits. This is a single-user lab system; OCR, public hosting, rich generated tables and comprehensive scale/security/accessibility certification remain outside verified scope. See LIMITATIONS.md, AWS_LIVE_VERIFICATION.md and EVALUATION_GUIDE.md.
