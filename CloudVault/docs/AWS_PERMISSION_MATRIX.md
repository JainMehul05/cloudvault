# AWS permission and operation matrix

Read access does not establish provisioning permission. The following distinctions are based on actual calls in this account; they do not assert unrestricted administrator access.

| Capability | Read/discovery | Provision/configure | Data write or invocation | End-to-end result |
|---|---|---|---|---|
| Original S3 storage | Bucket/HEAD/list diagnostics passed | Existing bucket preserved; EventBridge notification merged | Normal application upload/download passed | Exact fixture bytes match; unrelated originals retained |
| S3 Vectors | Get/List/Query passed | Dedicated bucket/index creation passed | Put and read-back passed | Live semantic search and RAG use AWS, 10/10 curated top-1 |
| DynamoDB | Describe/Query/Get passed | Table creation passed | Conditional Put passed | Live file metadata, tombstones and job stages |
| IAM/CloudFormation | Stack/change set inspection passed | Scoped roles and 20-resource stack passed | Authorized service assumption exercised | Lambda and workflow operated using assigned roles |
| Lambda | Config/concurrency/log inspection passed | Code/config deployment passed | Real invocation/partial failures passed | Native event chain completed; no local model in Lambda |
| SQS/DLQ | Attributes and bounded receives passed | Main/DLQ/mapping configuration passed | Send, consume and controlled redrive passed | Native workflow success; isolated DLQ driver separately identified |
| EventBridge | Rule inspection passed | Exact-prefix route and permission passed | Native S3 ObjectCreated delivered | Full canary success; route paused afterward |
| Step Functions | Execution/history read passed | Standard state machine passed | Real success, duplicate and failure executions | Idempotency and Catch/terminal failure verified |
| CloudWatch | Native metrics/log reads passed | 3-day log group retained | Actual structured Lambda logs appeared | Dashboard shows timestamped snapshot |
| API Gateway | API/route inspection passed | IAM HTTP routes and throttle passed | Unsigned 403, signed 200 | Server-side metadata access, no browser credentials |
| Standard SSM | Parameter retrieval passed | Three configuration parameters passed | Runtime configuration read passed | Values cached, no secret stored |
| Bedrock | Previously returned OperationNotAllowed | Not attempted again | Not invoked for inference | Restricted; local Qwen retained |

`AWS_PREFLIGHT.json` records the initial read-only probe. Mutation evidence is in the separate gate, API and workflow reports. No paid-only fallback was activated when a service was unnecessary or restricted. Broader regional/account permissions remain untested.
