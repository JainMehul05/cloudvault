# Source audit — 24 November 2026

## Scope and preservation

The downloaded local tree is authoritative. There was no `.git` directory. An initial Git commit preserves the local foundation and user-added cloudvault-test.txt / embedding-test.json. Existing `.venv` and node_modules are ignored runtime dependencies. No upstream application source was replaced. CloudVault lives in its own directory, retaining copies of LICENSE and NOTICE.

Reviewed README, LICENSE, NOTICE, infrastructure templates, packaged templates, publish.py, samconfig.toml, Python manifests, frontend manifests/configuration, App/main, upload/search/document hooks, authentication/layout/dashboard components, AppSync dispatcher/document resolvers, search/query Lambdas, file detection/processing, common extraction/storage libraries, state-machine definitions, scripts, test inventory, docs and CI workflows. Existing tests were inspected as source; the entire original cloud deployment suite was not executed. This is a targeted architecture and implementation audit, not a claim of exhaustive line-by-line verification of every upstream file.

## Findings

| Severity | Source evidence | Finding and action |
|---|---|---|
| Blocker for this account | template.yaml:1549, 2751, 2845–2846; README deployment instructions | Nova multimodal embeddings are configured, with us-east-1 availability documented. CloudVault replaces remote inference with local MiniLM; no stack deployment. |
| Blocker for local standalone use | src/ui/src/config.ts | Region falls back to us-east-1. Cognito pools, AppSync endpoint and S3 bucket require deployment outputs. New configuration explicitly restricts Sydney. |
| Blocker for intended simplification | src/ui/src/main.tsx and App.tsx | Amplify initialization and Cognito RequireAuth wrap application routes. Replaced by a localhost-only single-user REST application. |
| Blocker for independent search | hooks/useSearch.ts; src/lambda/search_kb/index.py | GraphQL query delegates to Bedrock agent runtime and knowledge-base configuration. Replaced with persistent numerical embeddings and NumPy cosine similarity. |
| Integration coupling | hooks/useUpload.ts and useDocuments.ts | Upload authorization, Amplify storage, GraphQL subscriptions, DynamoDB metadata and processing infrastructure are interdependent. Changing region alone would not make this run locally. New backend coordinates S3, extraction and SQLite. |
| Cost / cleanup | template.yaml DeletionPolicy: Retain on multiple resources | Deleting a deployed stack can leave resources. CloudVault provisions none; only existing S3 storage is used. |
| Scope complexity | src/ragstack-chat, src/ragstack-mcp, scrape/media Lambdas | Chat, scraping, MCP, transcription and multimodal workflows are outside the requested lab scope. Preserved upstream but excluded from new runtime. |
| Configuration | publish.py, packaged.yaml, ragstack-packaged.yaml, samconfig.toml | Packaging/deployment machinery targets full cloud infrastructure; not a local FastAPI launch path. Do not run these to start CloudVault. |
| Security context | Auth components, API key resolver, common auth helpers | Upstream provides real auth mechanisms; they should not be called fake or insecure solely because local credentials are absent. CloudVault uses a different, explicitly single-user threat model. |
| Test gap | tests/, playwright.config.ts, .github/workflows | Substantial upstream tests exist, but do not verify the new S3 + SQLite + CPU model architecture. New focused tests and actual AWS/browser checks are required. |
| Maintainability | upstream components and service modules | Existing implementation is modular but has a much larger operational surface. No blanket claim of dead code, broken imports or insecure dependencies is made without runtime evidence. New runtime removes those dependencies rather than editing the foundation. |

## Working foundation and unverified behavior

Source supports genuine cloud uploads, extraction, document management, search, chat and media processing when its infrastructure and model permissions are supplied. Those original deployed behaviors were not runtime-verified here. No existing deployment was modified. The previously reported Bedrock invocation denial is supplied account evidence; it was deliberately not re-invoked.

## Runtime-verified account facts

AWS CLI STS authentication succeeded. Boto3 1.44.10 with CRT also resolved the existing login session. Bucket location is ap-southeast-2. All four public-access-block flags were true. Neither credentials nor tokens were copied to project files. No new AWS service was provisioned.

## New implementation risks to verify

Cross-system operations cannot form one atomic S3/SQLite transaction. Recovery records, explicit indexing states and read-only reconciliation make partial failures visible. Local vectors require backups. CPU inference and bounded parsers suit academic document sets rather than hostile multi-tenant workloads. See TEST_REPORT.md and LIMITATIONS.md for verified results and remaining limits.
