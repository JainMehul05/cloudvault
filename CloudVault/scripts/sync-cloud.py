"""Bounded approved migration; keeps vectors and IDs; activates after read-back/rank checks."""
import argparse
import json
from pathlib import Path
import sys
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'backend'))
from app import cloud
from app.database import initialize, connect
from app.storage import session
from app.search import search

parser = argparse.ArgumentParser(); parser.add_argument('--apply', action='store_true'); args = parser.parse_args()
if not args.apply:
    print('Dry-run: migrate <=1000 stored vectors and <=100 existing file metadata records. No re-embedding.'); raise SystemExit()
plan = session().client('freetier').get_account_plan_state()
assert plan['accountPlanType'] == 'FREE' and plan['accountPlanStatus'] == 'ACTIVE' and plan['accountPlanRemainingCredits']['amount'] >= 1, 'Free plan/credit guard failed'
manifest = json.loads((ROOT / '.runtime/cloud-resources.json').read_text())
assert manifest.get('vector_canary_verified') and manifest.get('metadata_canary_verified')
initialize()
with connect() as db:
    files = [r['id'] for r in db.execute('SELECT id FROM files ORDER BY id LIMIT 101')]
    vectors = [dict(r) for r in db.execute('SELECT * FROM chunks ORDER BY id LIMIT 1001')]
assert len(files) <= 100 and len(vectors) <= 1000
path = ROOT / '.runtime/cloud-config.json'
previous = path.read_text() if path.exists() else '{}'
cfg = {**json.loads(previous), **{k: manifest[k] for k in ['region', 'table', 'vector_bucket', 'vector_index']}}
cfg.update(vectors_enabled=True, metadata_enabled=True)
cloud.configuration = lambda: cfg  # Process-scoped configuration; running app remains unchanged until verified.
try:
    for file_id in files:
        cloud.sync_file(file_id)
    remote, source = cloud.metadata_rows()
    assert source.startswith('dynamodb') and 'pending_sync' not in source and {r['id'] for r in remote} == set(files)
    scope = {'vectorBucketName': cfg['vector_bucket'], 'indexName': cfg['vector_index']}
    for start in range(0, len(vectors), 100):
        batch = vectors[start:start+100]
        found = cloud.client('s3vectors').get_vectors(**scope, keys=[cloud.vector_key(r) for r in batch], returnData=True, returnMetadata=True)
        mapped = {v['key']: v for v in found['vectors']}
        for row in batch:
            assert np.allclose(mapped[cloud.vector_key(row)]['data']['float32'], np.frombuffer(row['vector'], dtype=np.float32), atol=1e-6)
    outcomes = []
    for case in json.loads((ROOT / 'samples/expected_queries.json').read_text()):
        result = search(case['query'], 'semantic', 5, .25)
        assert result['retrieval_backend']['provider'] == 's3vectors'
        names = [r['file']['original_name'] for r in result['results']]
        rank = names.index(case['expected'])+1 if case['expected'] in names else None
        outcomes.append({**case, 'rank': rank, 'backend': result['retrieval_backend']})
        assert rank == 1, (case, names)
    report = {'metadata_source': source, 'files_verified': len(files), 'stored_vectors_read_back': len(vectors), 'original_vectors_reused': True, 'semantic_cases': outcomes, 'activated': True}
    (ROOT / 'docs/AWS_GATE1_VERIFICATION.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    temporary = path.with_suffix('.verified.tmp')
    temporary.write_text(json.dumps(cfg, indent=2), encoding='utf-8')
    temporary.replace(path)
    print(json.dumps(report, indent=2))
except BaseException:
    raise  # Activation file was never changed on failure.
