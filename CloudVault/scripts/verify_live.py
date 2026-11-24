"""Read-only verification of files already uploaded through the website. No S3 deletes."""
import hashlib
import json
import sys
from pathlib import Path
import httpx

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root/'backend'))
from app import storage

client = httpx.Client(base_url='http://127.0.0.1:8000',timeout=120)
files = client.get('/api/files',params={'page_size':100}).raise_for_status().json()['items']
report = {'aws':storage.diagnostics(),'objects':[],'semantic':[],'keyword':None,'hybrid':None}
for record in files:
    original = (root/'samples'/record['original_name'])
    if not original.exists(): continue
    expected = original.read_bytes()
    downloaded = client.get('/api/files/'+record['id']+'/download').raise_for_status().content
    cloud = storage.read(record['object_key'])
    assert downloaded == cloud == expected
    head = storage.s3().head_object(Bucket=storage.settings.s3_bucket,Key=record['object_key'])
    assert head['ContentLength'] == len(expected)
    report['objects'].append({'id':record['id'],'key':record['object_key'],'size':len(expected),'sha256':hashlib.sha256(expected).hexdigest(),'byte_match':True,'encryption':head.get('ServerSideEncryption'),'status':record['status']})
for case in json.loads((root/'samples'/'expected_queries.json').read_text()):
    results = client.get('/api/search',params={'q':case['query'],'mode':'semantic','top_k':5}).raise_for_status().json()['results']
    names = [r['file']['original_name'] for r in results]
    rank = names.index(case['expected'])+1 if case['expected'] in names else None
    report['semantic'].append({**case,'rank':rank,'results':[{'name':r['file']['name'],'similarity':r['score']} for r in results]})
    assert rank == 1,(case,results)
for mode in ('keyword','hybrid'):
    data=client.get('/api/search',params={'q':'remotely managed','mode':mode}).raise_for_status().json()
    assert data['results'][0]['file']['original_name']=='object-storage.txt'
    report[mode]={'top_file':data['results'][0]['file']['name'],'score':data['results'][0]['score']}
assert client.get('/api/search',params={'q':'qzxnomatch987','mode':'keyword'}).json()['total']==0
report['reconciliation']=client.get('/api/reconcile').raise_for_status().json()
report['settings']=client.get('/api/settings').raise_for_status().json()
destination = root/'docs'/('AWS_VERIFICATION_V2.json' if '--v2' in sys.argv else ('LIVE_VERIFICATION_RESTART.json' if '--restart' in sys.argv else 'LIVE_VERIFICATION.json'))
destination.write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
