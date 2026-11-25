# CloudVault 3.0 verification

Final backend regression: **46 tests passed in 38.90 s**. Frontend: **12 tests passed**; production TypeScript/Vite build, ESLint and Ruff passed. Tests use isolated temporary data/fake cloud clients; these results do not substitute for real AWS validation.

Coverage includes storage lifecycle/search/extraction, safe previews, additive migration, vector preservation, scope/history/cancel, nonexistent/invented/unrelated citations and unsupported numbers, cloud scope/stale-key rejection, cosine distance conversion, durable outbox and conditional revisions, explicit local fallback, FREE/Paid/expired/low-credit fail-closed behavior, scoped obsolete-vector cleanup, URL navigation and frontend formatting/helpers.

Real external checks are documented separately in AWS_LIVE_VERIFICATION.md: actual S3 bytes; cloud vector/metadata migration/read-back; native event chain; signed IAM API; Standard SSM; real structured logs/native metrics; failure/duplicate/DLQ scenarios; restored fixture rank-1 and genuine generated answer. Preservation confirms 10 unaffected documents and 59 exact original vectors, plus prior conversations/exchanges. No unrelated original was deleted.

Actual local Qwen tests include multi-document synthesis, follow-up, scoped answer, unavailable-runtime/extractive mode, no evidence, cancellation and contradictory policies. Quote checks are not a formal factuality guarantee. Source and raw evidence files are retained.

Browser QA uses the real Brave application, not screenshots generated from mock data. Genuine v2/v3 screenshots, responsive measurements and final observations live under screenshots. Automated file selection/download can be blocked by browser controls; restoration used the normal app upload API and that distinction is recorded. The user separately confirmed normal original download works.

No formal WCAG certification, independent penetration test, load test, billing reconciliation or broad model benchmark is claimed. NPM_AUDIT_V2.json/PYTHON_AUDIT_V2.json are historical dependency snapshots; no new v3 model/dependency was installed. Torch's local GPU build has the audit-tool matching limitation described in SECURITY.md.
