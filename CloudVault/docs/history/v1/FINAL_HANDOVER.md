# Final CloudVault handover

## Current status

**Core lab workflow implemented and verified.** The application is running at http://127.0.0.1:8000. It is a localhost single-user app using genuine private Amazon S3 originals and local CPU semantic search. No production-readiness or 100% completeness claim is made.

## Delivered work and evidence

| Requested deliverable | Location / verified result |
|---|---|
| Source audit and original problems | SOURCE_AUDIT.md; Cognito/AppSync/Bedrock coupling, region defaults, deployment/cost complexity verified from local source |
| Safe preservation | Initial Git checkpoint `4dc6f4abbd69f0322e09e7b4d7c29d4a20fe5b80`; upstream tracked source restored and no diff remained |
| Architecture and structure | ARCHITECTURE.md, FILE_STRUCTURE.md; separate CloudVault directory |
| Actual AWS usage | Existing Sydney S3 bucket only; STS for setup identity verification; no new infrastructure |
| File storage | Boto3, UUID private keys, conditional puts, AES256, real original-byte downloads |
| Semantic retrieval | Local all-MiniLM-L6-v2, measured 384 dimensions, normalized vectors and cosine similarity |
| Exact and hybrid retrieval | Full-text literal matching; reciprocal rank fusion with k=60 |
| UI/UX | New responsive CloudVault identity; Dashboard/My Files/Upload/Smart Search/Settings/About |
| File actions | Multi-file upload, drag/drop queue, status, preview, sort/filter, rename, reindex, confirmed delete |
| Backend/database | Modular FastAPI, Pydantic validation, persistent SQLite, foreign keys, transactional chunks, read-only reconciliation |
| Security | SECURITY.md; profile chain, loopback, origin/host checks, no active HTML previews, private bucket unchanged |
| Performance | CPU model reused in process, persistent vectors, cached model snapshot, bounded documents, linear NumPy for small datasets |
| Automated checks | 24 backend + 8 frontend tests passed; TypeScript/build, ESLint, Ruff, compileall and dependency compatibility passed |
| Dependency audit | npm audit: zero known vulnerabilities; Python compatibility checked, full Python CVE audit not claimed |
| Real S3 evidence | LIVE_VERIFICATION.json and LIVE_VERIFICATION_RESTART.json: eight fixture objects, exact hashes/bytes, AES256 |
| Browser evidence | Genuine screenshots; actual multi-file upload, search, preview, filtering, rename/cancel delete, responsive checks |
| Browser downloads | API/S3 byte-identical; automated attachment navigation blocked by Brave; user confirmed normal-browser download succeeds |
| Test objects created | Eight original fixtures totaling 2,309 bytes; exact UUID keys listed in live evidence, retained |
| Restart persistence | Actual stop/start followed by repeated retrieval and byte checks passed |
| Setup script | Executed successfully: exact dependencies, production build, database init, cached model dimension 384 and real S3 diagnostics |
| Startup/stop scripts | Executed successfully; owned PID/start-time/path checks, no broad process termination |
| Demonstration and viva | EVALUATION_GUIDE.md; VIVA_QUESTIONS.md with 54 questions/answers |
| Academic report | PROJECT_REPORT.md, Markdown, unknown student/institution details left as placeholders |
| Contributions and attribution | PROJECT_CONTRIBUTIONS.md; original LICENSE and NOTICE retained unchanged |
| Cost/cleanup | COST_AND_CLEANUP.md; no account upgrade/paid AI; S3 may consume credits; selective user-confirmed cleanup |
| Limitations and final review | LIMITATIONS.md and FINAL_QUALITY_AUDIT.md |

## Start / stop

```powershell
cd C:\Users\hp\Downloads\RAGStack-Lambda-main\CloudVault
.\scripts\start.ps1
# Later:
.\scripts\stop.ps1
```

First-time reconstruction: `scripts/setup.ps1`. Manual backend command: from backend, `.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000`. Frontend editing: from frontend, `npm run dev` at http://127.0.0.1:5173 with an API proxy. Production app and API docs are http://127.0.0.1:8000 and http://127.0.0.1:8000/docs. Keep AWS authenticated using `aws login --profile default` when required.

## Acceptance classification

**Implemented and tested:** real S3 upload/download integrity, real model/vector retrieval, exact/hybrid search, database persistence, extraction formats, API validation/errors, file management, responsive core pages, setup/start/stop, preserved attribution and evaluation materials. Normal-browser download is user-confirmed in addition to independent API evidence.

**Implemented but live destructive operation not tested:** real S3 deletion. Isolated deletion/cascade and protected-import rejection passed; browser confirmation/cancel passed. No real object was deleted for testing.

**Failed/restricted automation:** extension file setFiles required a browser permission change, so the native Windows picker was used; automated attachment navigation was blocked by Brave. No security settings were weakened. These automation limits do not invalidate the separately observed upload, API integrity or user-confirmed download.

**Not exhaustively tested:** real internet loss/session expiration, hostile-parser resource exhaustion, large-scale load, every browser/keyboard/accessibility combination, original upstream deployment and Python transitive CVE analysis.

**Optional future improvements:** OCR, folders/grid/theme, public hosting, multi-user auth, durable parser workers and controlled bulk recovery. No additional AWS resources should be introduced without approval.

## Evaluation sequence

Show Settings and the actual bucket; upload a non-sensitive sample; show the UUID object in the S3 console; search `remotely managed` exactly; switch to Semantic and ask `Where can I store my digital files remotely?`; preview and download the matching original; restart and repeat. Explain that only original storage is in AWS while AI and SQLite run locally. Review TEST_REPORT.md for detailed evidence and truthful boundaries.
