"""Bounded reconciliation of an existing upload missed while event processing was paused.
Uses real SQS/Lambda/workflow operations; never fabricates a native S3 event or rewrites originals.
"""
import argparse
import datetime
import hashlib
import json
from pathlib import Path
import sys
import time
from uuid import UUID
import boto3
import httpx

ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'backend'))
from app import cloud,storage
from app.database import get_file
parser=argparse.ArgumentParser();parser.add_argument('file_id');parser.add_argument('--apply',action='store_true');args=parser.parse_args();UUID(args.file_id)
record=get_file(args.file_id);assert record and record['owned'],'Only a known application upload is eligible'
assert record['original_name']=='water-conservation.txt' and record['sha256']=='820b6c111e37f2673aa071d4216645cce972fef583f6e3ad586d6430df2356c4','This verification driver is restricted to the approved water fixture'
if not args.apply:print('Dry-run: reconcile one existing upload through the bounded cloud queue; original will not be rewritten.');raise SystemExit()
s=boto3.Session(profile_name='default',region_name='ap-southeast-2');plan=s.client('freetier').get_account_plan_state();assert plan['accountPlanType']=='FREE' and plan['accountPlanStatus']=='ACTIVE' and plan['accountPlanRemainingCredits']['amount']>1
p=ROOT/'.runtime/cloud-resources.json';m=json.loads(p.read_text(encoding='utf-8'));out=m['serverless_outputs'];functions=s.client('lambda');events=s.client('events');queues=s.client('sqs')
assert events.describe_rule(Name='cloudvault-v3-dev-uploads')['State']=='DISABLED'
head=storage.s3().head_object(Bucket=storage.settings.s3_bucket,Key=record['object_key'])
raw=storage.read(record['object_key']);assert hashlib.sha256(raw).hexdigest()==record['sha256']
report={'started_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'file_id':record['id'],'upload_method':'normal_CloudVault_multipart_API','entry':'manual_reconciliation_via_SQS; native EventBridge delivery already verified separately','new_original_created_by_reconciliation':False,'original_sha256':record['sha256'],'original_bytes_match':True}
previous=ROOT/'docs/AWS_WATER_RESTORATION_VERIFICATION.json'
if previous.exists():
 history=ROOT/'docs/history/v3';history.mkdir(parents=True,exist_ok=True)
 archive='water-restoration-'+datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')+'.json'
 previous.replace(history/archive)
try:
 functions.update_event_source_mapping(UUID=out['MappingId'],Enabled=True)
 for _ in range(30):
  if functions.get_event_source_mapping(UUID=out['MappingId'])['State']=='Enabled':break
  time.sleep(2)
 else:raise RuntimeError('Mapping did not become ready')
 body={'source':'cloudvault.reconcile','detail':{'bucket':{'name':storage.settings.s3_bucket},'object':{'key':record['object_key'],'etag':head['ETag'].strip('"'),'sequencer':'manual-reconcile-'+record['sha256']}}}
 queues.send_message(QueueUrl=out['QueueUrl'],MessageBody=json.dumps(body))
 job=None
 for _ in range(60):
  candidates=[j for j in cloud.jobs() if j['file_id']==record['id']]
  if candidates:
   job=candidates[0]
   if job['state'] in {'awaiting_local_embedding','searchable','failed'}:break
  time.sleep(2)
 assert job and job['state'] in {'awaiting_local_embedding','searchable'},job
 assert job['cloud_extraction']=='approved_plain_text'
 if job['state']=='awaiting_local_embedding':cloud.complete_jobs(limit=3)
 job=next(j for j in cloud.jobs() if j['file_id']==record['id']);assert job['state']=='searchable'
 with httpx.Client(base_url='http://127.0.0.1:8000',timeout=180) as c:
  found=c.get('/api/search',params={'q':'How can farms avoid wasting water?','mode':'semantic','top_k':5}).raise_for_status().json();assert found['results'][0]['file']['id']==record['id'];assert found['retrieval_backend']['provider']=='s3vectors'
  assert c.get('/api/files/'+record['id']+'/download').raise_for_status().content==raw
  answer=c.post('/api/ai/ask',json={'question':'How can farmers reduce avoidable water loss?','file_ids':[record['id']]}).raise_for_status().json();assert answer['mode']=='generated',answer.get('warning');assert all(source['file_id']==record['id'] for source in answer['sources'])
 report.update(cloud_stage='succeeded',job_state=job['state'],stage_history=job.get('history',[]),cloud_extraction=job['cloud_extraction'],retrieval_backend=found['retrieval_backend'],semantic_rank=1,download_bytes_match=True,rag=answer)
finally:
 functions.update_event_source_mapping(UUID=out['MappingId'],Enabled=False)
 events.disable_rule(Name='cloudvault-v3-dev-uploads')
 m=json.loads(p.read_text(encoding='utf-8'));m['pipeline_paused']=True;p.write_text(json.dumps(m,indent=2),encoding='utf-8')
 report['event_processing_paused']=True;report['finished_at']=datetime.datetime.now(datetime.timezone.utc).isoformat();previous.write_text(json.dumps(report,indent=2),encoding='utf-8')
 print(json.dumps({k:v for k,v in report.items() if k!='rag'},indent=2),flush=True)
