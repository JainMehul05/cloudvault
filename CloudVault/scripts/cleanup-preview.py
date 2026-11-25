"""Read-only cleanup inventory. This script never deletes or disables anything."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / '.runtime/cloud-resources.json').read_text(encoding='utf-8'))
report = {
    'mode': 'preview_only_no_aws_calls',
    'requires_separate_explicit_cleanup_approval': True,
    'compute_stack': manifest.get('stack'),
    'proposed_order': [
        'Confirm EventBridge rule and SQS mapping are disabled.',
        'Export DynamoDB rows, job evidence and local SQLite using online backup.',
        'Review the current stack resource list and Retain policies before stack deletion.',
        'Remove only CloudVault-owned stack compute, API, queues, roles and parameters after approval.',
        'Review retained log groups separately; preserve evaluation evidence.',
        'Retain DynamoDB and vector bucket/index unless separately approved for deletion.',
        'Restore pre-existing bucket notifications only after comparing the saved before snapshot with current settings; preserve unrelated changes.',
    ],
    'never_delete': [
        'Existing S3 bucket or uploaded originals',
        'Local database, backups, conversations or models',
        'Any unrelated account resource',
    ],
    'external_data_resources_retained': {
        'metadata_table': manifest.get('table'),
        'vector_bucket': manifest.get('vector_bucket'),
        'vector_index': manifest.get('vector_index'),
    },
    'note': 'Paused event consumers reduce background usage; retained storage can still consume eligible credits. There is no destructive apply option.',
}
print(json.dumps(report, indent=2))
