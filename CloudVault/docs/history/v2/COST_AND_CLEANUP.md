# Cost control and safe cleanup

Only the existing Sydney S3 bucket is used. No AWS account upgrade, paid AI API, extra bucket, vector index, Lambda, EC2, RDS, OpenSearch, NAT gateway or CloudFormation stack was created. Local inference has no per-query API charge; it uses laptop CPU, RAM, disk and electricity.

S3 PUT/GET/HEAD/LIST operations, bytes stored and data transfer may consume credits or incur charges under your account's actual terms. No claim is made that AWS is permanently free, that the reported initial $100 credit is still available, or that the precise current bill was verified. Check the AWS Billing console. Avoid large files, frequent polling of AWS diagnostics, or repeated bulk integration runs.

Eight non-sensitive demo objects (2,309 bytes total) were created by website uploads. Their exact UUID keys and SHA256 hashes are in LIVE_VERIFICATION.json. They are intentionally retained for evaluation. The original cloudvault-test.txt and unrelated objects were not deleted. Unit tests use isolated in-memory storage, not S3, for destructive cases.

## Stop and retain

Run `scripts/stop.ps1` to stop the owned service only. This preserves SQLite and cloud originals. Keep the model cache and database for fast startup and persistent search.

## Selective cleanup after evaluation

Review the explicit manifest first. If you decide to remove a CloudVault-owned demo file, use My Files → Actions → Delete, inspect the irreversible-delete dialog, then confirm yourself. This deletes the specified original and cascades local index rows. Never run recursive bucket deletion or delete the bucket. Imported cloudvault-test.txt is protected by the API. In versioned buckets a delete may leave old versions; lifecycle cleanup requires separate review and authorization.

Run the read-only Settings reconciliation to see unmatched keys. It never mutates objects. Do not automatically delete or import unfamiliar keys. Local dependency folders and model caches may be removed manually after taking a private database backup, but setup will need internet to recreate them.
