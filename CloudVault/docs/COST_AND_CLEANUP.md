# Cost controls and selective cleanup

The user authorizes ₹0 out-of-pocket only. No Paid-plan upgrade, paid AI service or auto-upgrading feature is permitted. Read AWS_COST_ESTIMATE.md for the actual account check, regional price sources and the distinction between estimated credit consumption and a delayed bill.

At handover the EventBridge rule and SQS consumer are disabled, confirmed by read-only AWS calls. IAM metadata API, existing storage and on-demand vector queries remain usable. Retained originals, table, vectors, logs and other resources can still consume eligible credits; pausing is not deletion and not a zero-usage guarantee.

Preview the exact owned-resource cleanup inventory locally:

```powershell
backend/.venv/Scripts/python.exe scripts/cleanup-preview.py
```

This script makes no AWS calls and has no destructive apply option. Actual teardown requires a separate explicit approval. The approved implementation never authorized deletion of originals or unrelated resources.

Recommended teardown order after exporting evidence and data: verify consumers paused; export DynamoDB and online SQLite backup; inspect current CloudFormation resources/Retain policies; remove only owned stack compute/API/queues/roles/parameters; review retained logs; retain external metadata/vector data unless separately approved. Compare saved pre-v3 bucket notifications with current settings before any restoration, preserving unrelated later changes.

Never delete the original bucket, upload prefix, local database/backups/models or unrelated account resources as a shortcut. Synthetic DLQ and negative-test job evidence is retained. No teardown has been executed. Local stop scripts verify process ownership and preserve data.
