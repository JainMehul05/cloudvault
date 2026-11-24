# CloudVault 2.0

**Private AWS file storage, semantic search and local document intelligence.**

The 2.0 upgrade adds a responsive light/dark workspace, file grid/list and stars, safe previews, a command palette, improved hybrid evidence retrieval and Ask CloudVault. The assistant uses local Qwen2.5 3B generation with checked clickable citations, scoped follow-ups and local history. Explicit extractive answers remain available when the runtime is unavailable.

Start from PowerShell in this directory using `./scripts/start.ps1`, then open [CloudVault](http://127.0.0.1:8000). For the optional approved generation runtime use `./scripts/setup-ai.ps1` once and `./scripts/warmup.ps1` before a demonstration. No paid AI API or new AWS service is used. Existing S3 usage can still incur ordinary storage/request charges.

Read [local AI setup](docs/LOCAL_AI_SETUP.md), [RAG architecture](docs/RAG_ARCHITECTURE.md), [design system](docs/DESIGN_SYSTEM.md), [performance](docs/PERFORMANCE_REPORT.md) and [upgrade audit](docs/UPGRADE_AUDIT.md). The baseline is tagged `cloudvault-v1-baseline`; earlier reports are preserved in docs/history/v1.

---

# CloudVault

**AWS-Based Intelligent Cloud File Storage System with Semantic Search**  
Store intelligently. Search effortlessly.

CloudVault stores original files in your existing private Sydney Amazon S3 bucket. A local FastAPI service extracts text, builds genuine all-MiniLM-L6-v2 sentence embeddings on the CPU, and persists metadata, complete extracted text, chunks and vectors in SQLite. A new React/TypeScript interface provides file management and semantic, exact keyword, hybrid and filename search.

## Open the application

From PowerShell:

```powershell
cd C:\Users\hp\Downloads\RAGStack-Lambda-main\CloudVault
.\scripts\start.ps1
```

Open [CloudVault](http://127.0.0.1:8000). API documentation: [OpenAPI](http://127.0.0.1:8000/docs). One localhost server serves both the production frontend and backend; no Docker or cloud deployment is necessary.

First-time setup or reconstruction:

```powershell
.\scripts\setup.ps1
```

Stop only the CloudVault-owned server:

```powershell
.\scripts\stop.ps1
```

If AWS authentication expires, run `aws login --profile default`, complete the browser login, then retry. Never add root keys or permanent credentials to source files. `.env.example` contains non-secret configuration; setup copies it only when `.env` is absent.

## Demonstrate the project

The eight original sample documents have been uploaded through the website during validation. Start with Smart Search: “Where can I store my digital files remotely?” Then select Exact keyword and enter `remotely managed`. Download the matching original and compare it to `samples/object-storage.txt`. Settings shows the actual AWS diagnostic. The AWS console should show the recorded key under `cloudvault/files/` in `cloudvault-d0c2b49b4347`.

See [evaluation guide](docs/EVALUATION_GUIDE.md), [test evidence](docs/TEST_REPORT.md), [project report](docs/PROJECT_REPORT.md) and [viva preparation](docs/VIVA_QUESTIONS.md). Raw AWS object manifests, real cosine scores and byte comparisons are recorded in `docs/LIVE_VERIFICATION*.json`.

## Manual development and checks

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
# Another terminal, if editing frontend:
cd C:\Users\hp\Downloads\RAGStack-Lambda-main\CloudVault\frontend
npm run dev
```

The Vite development server on port 5173 proxies `/api` to port 8000. Restart the backend after making a production build so it mounts the latest assets.

```powershell
cd C:\Users\hp\Downloads\RAGStack-Lambda-main\CloudVault\backend
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\ruff.exe check app tests
cd ..\frontend
npm run typecheck
npm run lint
npm test
npm run build
npm audit
```

## Scope and safeguards

Single-user localhost operation only. S3 holds originals; SQLite and AI run locally. Do not expose this service on a public interface. Unsupported binaries remain downloadable but are not content indexed. Scanned PDFs need OCR. Text preview is inert escaped text. Each upload gets a UUID key; imported `cloudvault-test.txt` is protected from deletion. Index failures retain stored originals and can be retried. No paid AI API, Bedrock, Lambda or additional AWS infrastructure is used. S3 requests, storage and transfer may consume credits; AWS is not permanently free.

## Attribution

Preserved foundation: [HatmanStack/RAGStack-Lambda](https://github.com/HatmanStack/RAGStack-Lambda), copyright 2024 Christopher Galliart. Original Apache 2.0 LICENSE and NOTICE are retained here and at the workspace root. CloudVault is a new simplified application alongside that foundation; it does not claim the upstream implementation as original work. See [contribution summary](docs/PROJECT_CONTRIBUTIONS.md) and [source audit](docs/SOURCE_AUDIT.md).


