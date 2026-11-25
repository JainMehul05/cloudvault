"""Read-only final preservation/account/paused-pipeline audit; no object writes."""
import datetime
import hashlib
import json
from pathlib import Path
import sqlite3
import sys
import boto3

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'backend'))
from app.config import settings

old = sqlite3.connect(ROOT / 'data/backups/pre-v3/cloudvault.db')
old.row_factory = sqlite3.Row
current = sqlite3.connect(ROOT / 'data/cloudvault.db')
current.row_factory = sqlite3.Row
session = boto3.Session(profile_name=settings.aws_profile, region_name=settings.aws_region)
plan = session.client('freetier').get_account_plan_state()
assert plan['accountPlanType'] == 'FREE' and plan['accountPlanStatus'] == 'ACTIVE'
assert plan['accountPlanRemainingCredits']['amount'] > 1
storage = session.client('s3')
checked_files = checked_vectors = 0
for before in old.execute('SELECT * FROM files'):
    if before['original_name'] == 'water-conservation.txt':
        continue  # Known application deletion; restored through normal upload with a new ID.
    after = current.execute('SELECT * FROM files WHERE id=?', (before['id'],)).fetchone()
    assert after and after['object_key'] == before['object_key'] and after['sha256'] == before['sha256']
    head = storage.head_object(Bucket=settings.s3_bucket, Key=after['object_key'])
    assert head['ContentLength'] == before['size']
    checked_files += 1
    for chunk in old.execute('SELECT * FROM chunks WHERE file_id=?', (before['id'],)):
        other = current.execute('SELECT * FROM chunks WHERE id=? AND file_id=?', (chunk['id'], before['id'])).fetchone()
        assert other and other['vector'] == chunk['vector'] and other['text'] == chunk['text']
        checked_vectors += 1
for table in ('conversations', 'exchanges'):
    for row in old.execute('SELECT * FROM ' + table):
        other = current.execute('SELECT * FROM ' + table + ' WHERE id=?', (row['id'],)).fetchone()
        assert other and all(other[k] == row[k] for k in row.keys() if k != 'updated_at')
manifest = json.loads((ROOT / '.runtime/cloud-resources.json').read_text(encoding='utf-8'))
mapping = session.client('lambda').get_event_source_mapping(UUID=manifest['serverless_outputs']['MappingId'])
rule = session.client('events').describe_rule(Name='cloudvault-v3-dev-uploads')
assert mapping['State'] == 'Disabled' and rule['State'] == 'DISABLED'
water = current.execute("SELECT * FROM files WHERE original_name='water-conservation.txt'").fetchone()
assert water and water['status'] == 'indexed'
assert water['sha256'] == hashlib.sha256((ROOT / 'samples/water-conservation.txt').read_bytes()).hexdigest()
report = {
    'checked_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'unchanged_original_documents': checked_files,
    'unchanged_original_vectors': checked_vectors,
    's3_validation': 'HEAD size and existence for all unaffected originals; exact restored bytes verified in separate restoration report',
    'prior_conversations_and_exchanges_preserved': True,
    'restored_water_file_id': water['id'],
    'event_rule': rule['State'], 'queue_mapping': mapping['State'],
    'account_plan': plan['accountPlanType'], 'account_status': plan['accountPlanStatus'],
    'remaining_credits_usd': plan['accountPlanRemainingCredits']['amount'],
    'expires_at': str(plan['accountPlanExpirationDate']),
    'account_upgrade_performed': False,
    'current_files': current.execute('SELECT COUNT(*) FROM files').fetchone()[0],
    'current_vectors': current.execute('SELECT COUNT(*) FROM chunks').fetchone()[0],
}
(ROOT / 'docs/PRESERVATION_VERIFICATION_V3.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report, indent=2))
