# CloudVault 3.0

Private AWS storage, cloud semantic retrieval and local document intelligence, with a responsive landing page and workspace.

Start from PowerShell in this directory:

```powershell
./scripts/start.ps1
./scripts/warmup.ps1
```

Open [CloudVault](http://127.0.0.1:8000). The landing page opens the workspace at `/workspace`; direct routes include `/workspace/files`, `/workspace/search`, `/workspace/ask` and `/workspace/cloud`. API reference: [local OpenAPI](http://127.0.0.1:8000/docs). Stop only the owned application with `./scripts/stop.ps1`; stop its separately owned AI runtime with `./scripts/stop-ai.ps1`.

Existing models, data and credentials are already configured. Do not rerun setup or download weights for a normal start. If reconstructing the source in another environment, review `docs/LOCAL_AI_SETUP.md` and `.env.example`, then `scripts/setup.ps1`. Authentication refresh uses `aws login --profile default`; never commit credentials.

## Delivered

- Premium light/dark/system landing and workspace, file grid/list/stars, safe preview, upload progress, command palette and keyboard navigation.
- Real storage/type/activity charts, actual index/model status and timestamped CloudWatch metrics/job history.
- Private S3 originals, DynamoDB metadata and actual S3 Vectors semantic queries. Exact, hybrid and filename search retained.
- Genuine local Qwen2.5 3B generation from multi-document hybrid evidence, checked clickable citations, follow-ups, Stop, conversation history and explicit extractive fallback.
- Real bounded S3 → EventBridge → SQS → Lambda → Standard Step Functions → DynamoDB cloud stage; outbound local completion to cloud vectors. IAM HTTP API, Standard SSM configuration, scoped IAM and CloudFormation.

UI/API, MiniLM embedding generation, complete extracted text, local fallback index and Qwen generation run on this laptop. AWS never calls localhost. The application is a private single-user lab system, not a publicly hosted multi-tenant SaaS.

## Financial boundary

**₹0 out of pocket; never upgrade the AWS Free plan.** Final account evidence: FREE/ACTIVE, US$140 promotional credit, expiry 24 May 2027. Application cloud calls fail closed on unknown/expired/Paid/low-credit status. Event rule and SQS consumer are paused between bounded rehearsals. Eligible storage/requests still consume credits; a cached guard is not an AWS billing cap. See [cost controls](docs/AWS_COST_ESTIMATE.md) and [cleanup](docs/COST_AND_CLEANUP.md).

## Evidence and evaluation

Read [handover](docs/FINAL_HANDOVER.md), [architecture](docs/ARCHITECTURE.md), [real AWS verification](docs/AWS_LIVE_VERIFICATION.md), [resource inventory](docs/AWS_RESOURCE_INVENTORY.md), [tests](docs/TEST_REPORT.md), [demo guide](docs/EVALUATION_GUIDE.md) and [requirements status](REQUIREMENTS_STATUS.md). `RESUME_CHECKPOINT.md` records exactly what to resume. Source attribution and original LICENSE/NOTICE are retained; historical reports are under `docs/history`.

Checks: `backend/.venv/Scripts/python.exe -m pytest backend/tests -q`; `backend/.venv/Scripts/ruff.exe check backend/app backend/tests`; in `frontend`, `npm run build`, `npm run lint`, `npm test`. Current results: 46 backend and 12 frontend tests passing. Real cloud/model/browser evidence is separate from isolated unit tests.
