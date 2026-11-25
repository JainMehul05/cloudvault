# CloudVault 3.0 acceptance status

| Requirement | Classification | Evidence / practical boundary |
|---|---|---|
| Resume without discarding source/data/models | Implemented and tested | v1 tag, v2 checkpoint 18bf7e3, v3 checkpoint 53dab00; online pre-v3 backup; preservation report |
| Consolidated cloud approval / ₹0 constraint | Approved and enforced | User included IAM API; FREE/ACTIVE credit guard; no Paid upgrade or paid AI API |
| Private S3 originals/download | Implemented and tested | Normal upload; exact restored bytes; other10 originals preserved |
| Real cloud semantic retrieval | Implemented and tested | S3 Vectors migration/read-back, live search/RAG, final10/10 curated top1 |
| DynamoDB durable metadata / outbox | Implemented and tested | Conditional writes, signed metadata listing, tombstones, pending revision overlay |
| Actual event/serverless workflow | Implemented and tested; paused between rehearsals | Native S3/EventBridge/SQS/Lambda/Standard workflow canary, local completion, real logs |
| Failure handling / idempotency / DLQ | Implemented and tested within recorded scenarios | Deployed partial rejection, separate real SQS redrive driver, Catch/terminal failure, duplicate execution |
| IAM API, Standard SSM, scoped roles, IaC | Implemented and tested | unsigned403/signed200,3 parameters, reviewed20-resource stack |
| Landing / direct routes / light-dark UI | Implemented and browser tested | Genuine screenshots, back/forward/refresh and real product links |
| Dashboard actual charts / metrics | Implemented and tested | SQLite bytes/types/timestamps, native SVG, 7/30 day control, timestamped CloudWatch snapshot |
| Responsive / keyboard / motion | Implemented and targeted browser tested | 90 route-width checks320..1920; mobile margin transition fixed; existing keyboard/dialog/reduced-motion behavior. No certification |
| File management / upload / preview / search | Preserved and regression tested | Grid/list/stars, filters, queue, safe text/raster, four search modes; no unrelated deletion |
| Genuine local multi-document generation | Implemented and actual-model tested | Qwen3B GPU, cloud retrieval, distinct source citations; broader answer correctness remains limited |
| Citations / follow-ups / abstention / fallback | Implemented and tested in recorded cases | Exact quote/ID/relevance/numeric/word anchoring, one correction, partial supported claims, explicit fallback. Not entailment proof |
| Performance on RTX4050 | Measured with limitations | Warm seconds vs cold model-import delays; warmup recommended; no SLA |
| Documentation / lab guide / viva / resume | Implemented | Current handover, AWS inventory/permissions/cost/live/recovery, academic report, original attribution |
| Bedrock inference | Blocked, excluded | Known account OperationNotAllowed; no upgrade/retry dependency |
| SNS/Textract/OCR/public hosting/extra reranker | Optional future enhancement, not implemented | No meaningful approved need or measured gain; no paid service substituted |
| Rich generated Markdown tables / token streaming / enterprise auth | Optional future enhancement, not implemented | Safe plain claim paragraphs and asynchronous progress/Stop used; single-user localhost |

Historical failed attempts remain labeled in raw evidence: native water watcher timed out before upload; normal API restoration + real SQS reconciliation then passed. Later model-quality experiments are preserved; do not relabel all generated answers as verified facts. See FINAL_QUALITY_AUDIT.md and LIMITATIONS.md.
