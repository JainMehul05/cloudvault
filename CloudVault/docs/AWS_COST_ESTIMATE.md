# Free-plan and credit controls

The final read-only account check recorded **FREE / ACTIVE, US$140 promotional credit**, expiring **24 May 2027**. See `PRESERVATION_VERIFICATION_V3.json` for the timestamp and exact result. The initial approval-time balance was US$100; the later increase is an observed account balance, not a purchase or upgrade performed by this project.

The absolute requirement is **₹0 out of pocket**. No Paid-plan upgrade, payment subscription, paid AI API or paid-only alternative is authorized. AWS's Free plan permits selected services and uses eligible credits; eligibility must be verified in the actual account rather than inferred from a public free-tier advertisement. [AWS Free-plan documentation](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-plans.html).

The application checks GetAccountPlanState before optional AWS work, caching the result for 60 seconds. It permits only FREE/ACTIVE with more than US$1 eligible credit. Unknown status, expiry, Paid plan or low credit fails closed: cloud search/metadata use explicit local fallback; S3 operations return a clear unavailable response. This is an application guard, **not an AWS hard spending cap**. Already deployed cloud resources cannot depend on a laptop check. Therefore event routing and the SQS consumer are disabled between bounded rehearsals; API access is IAM protected and throttled.

## Regional rates used for the bounded estimate

Official Sydney price-list evidence and publication dates: `AWS_PRICE_SOURCES.json`. Examples below exclude taxes, data-transfer edge cases and any applicable allowances; they illustrate credit consumption, not an authorization to pay.

| Meter | Observed public rate | Small usage example |
|---|---|---|
| S3 Vectors storage | US$0.066 / GB-month | Less than 1 MB of demo vectors is below US$0.000066/month at this rate |
| Vector query request | US$0.0000027 / request, plus processing data meters | 100 requests: US$0.00027 request component |
| Vector PUT | US$0.219 / GB | Tiny existing corpus; no mass re-embedding |
| DynamoDB writes / reads | US$0.71 / US$0.1425 per million units | 1,000 writes: US$0.00071 before item-size effects |
| Lambda x86 | US$0.0000166667 / GB-second + US$0.20/million requests | 100 one-second invocations at 256 MB: about US$0.000417 compute |
| SQS Standard | US$0.40 / million requests | 1,000 requests: US$0.0004; continuous polling avoided |
| Standard workflow | US$0.000025 / transition | 100 transitions: US$0.0025 |
| HTTP API | US$1.29 / million requests in the first tier | 1,000 requests: US$0.00129 |

S3 original storage/requests, EventBridge events and log ingestion/storage also consume eligible allowances or credits. The approved rehearsal estimate was below US$0.25; this is a conservative estimate, **not a measured final bill**. US$1 was an operating envelope, never a hard billing cap. Billing meters can arrive late. No report claims exact zero credit usage or reconciles a delayed bill from request counts alone.

Controls: no NAT/VM/database cluster/provisioned concurrency; one 256 MB Lambda; 30-second timeout; batch 1/concurrency 2; finite retries and DLQ; 1 rps/burst 2 API; short logs; no custom metrics or scheduled polling; no secrets in paid stores; only three Standard parameters. Retained table/vector/log/storage resources can consume credits while idle. Review account expiry before each evaluation and use `COST_AND_CLEANUP.md` afterward.
