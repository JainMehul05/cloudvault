# CloudVault 3.0 requirements status

| Requirement group | Current status | Evidence / next action |
|---|---|---|
| Existing source/data/model protection | Implemented and verified | 18bf7e3 checkpoint; pre-v3 SQLite backup; no cloud mutation |
| Local semantic/exact/hybrid search and Qwen RAG | Implemented and tested before 3.0 | docs/TEST_REPORT.md; rerun baseline |
| Existing S3 storage/download privacy | Implemented and tested before 3.0 | AWS_VERIFICATION_V2.json; recheck current access |
| AWS eligibility/credits/permissions | In progress | Read-only preflight; do not infer provision permissions |
| Consolidated provisioning approval | Pending | Must precede resource/IAM/notification changes |
| S3 Vectors actual search and DynamoDB metadata | Not implemented | Gate 1 after approval, canary then flags |
| Lambda + CloudWatch cloud processing | Not implemented | Gate 2 after approval |
| SQS/EventBridge/Step Functions | Not implemented | Gate 3; one active route and bounded retries |
| IAM-authenticated API Gateway | Conditional, not implemented | Explicit endpoint approval required |
| SNS/SSM/Textract | Optional and unapproved | Only meaningful eligible bounded uses |
| Premium file/search/assistant workspace/themes | Implemented; final 3.0 QA pending | screenshots/v2; preserve working design |
| Landing page + URL routes | Not implemented | Local-only work may proceed now |
| Real dashboard charts/cloud metrics | Partially implemented | Existing counts/type distribution; add real timestamp/byte analytics |
| Cloud Infrastructure page/diagram | Not implemented | Show actual vs planned status truthfully |
| Expanded retrieval/contradiction evaluation | Partially implemented | Existing tests/evidence; extend predefined cases |
| Final 3.0 docs/demo/viva/screenshots | Pending | Update current reports; preserve historical evidence |

Bedrock invocation has a known account restriction; do not retry or make it a dependency. No cloud capability is considered implemented until real end-to-end verification succeeds.
