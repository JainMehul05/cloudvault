"""One approved real upload rehearsal; always pauses event triggers in finally."""
import argparse
import datetime
import hashlib
import json
from pathlib import Path
import sys
import time
import boto3
from botocore.config import Config
import httpx

ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'backend'))
parser=argparse.ArgumentParser();parser.add_argument('--watch-upload',action='store_true');parser.add_argument('--fixture',choices=['cloud-stage-canary.txt','water-conservation.txt'],default='cloud-stage-canary.txt');args=parser.parse_args()
from app import cloud
from app.config import settings
from app.database import connect,public_file

path=ROOT/'.runtime/cloud-resources.json';m=json.loads(path.read_text());out=m['serverless_outputs']
s=boto3.Session(profile_name='default',region_name='ap-southeast-2');cfg=Config(connect_timeout=5,read_timeout=15,retries={'max_attempts':1})
plan=s.client('freetier',config=cfg).get_account_plan_state()
assert plan['accountPlanType']=='FREE' and plan['accountPlanStatus']=='ACTIVE' and plan['accountPlanRemainingCredits']['amount']>=1
events=s.client('events',config=cfg);functions=s.client('lambda',config=cfg);states=s.client('stepfunctions',config=cfg);storage=s.client('s3',config=cfg)
with connect() as database:
 before_ids={r['id'] for r in database.execute('SELECT id FROM files')}
report={'started_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'upload_method':'application_api','plan':'FREE','personal_spend_authorized':False}
try:
 events.enable_rule(Name='cloudvault-v3-dev-uploads')
 functions.update_event_source_mapping(UUID=out['MappingId'],Enabled=True)
 for _ in range(30):
  if functions.get_event_source_mapping(UUID=out['MappingId'])['State']=='Enabled':break
  time.sleep(2)
 else:raise RuntimeError('Queue mapping did not enable within bounded window')
 fixture=ROOT/'samples'/args.fixture;raw=fixture.read_bytes()
 with httpx.Client(base_url='http://127.0.0.1:8000',timeout=180) as local:
  if args.watch_upload:
   print('Cloud route ready; waiting up to 120 seconds for the normal application upload.',flush=True)
   record=None
   for _ in range(60):
    with connect() as database:
     candidates=[public_file(r) for r in database.execute('SELECT * FROM files WHERE original_name=?',(fixture.name,)) if r['id'] not in before_ids and r['status'] not in {'uploading','upload_failed'}]
    if candidates:record=candidates[0];break
    time.sleep(2)
   assert record,'No normal application upload observed in bounded window'
   driver=ROOT/'.runtime/water-upload-driver.json'
   report['upload_method']=json.loads(driver.read_text()).get('method','observed_application_upload') if driver.exists() else 'observed_application_upload_method_not_verified'
  else:
   upload=local.post('/api/files/upload',files={'file':(fixture.name,raw,'text/plain')});upload.raise_for_status();record=upload.json()
  file_id=record['id']
  assert storage.head_object(Bucket=settings.s3_bucket,Key=record['object_key'])['ContentLength']==len(raw)
  original=storage.get_object(Bucket=settings.s3_bucket,Key=record['object_key']);stored=original['Body'].read();original['Body'].close();assert stored==raw
  report.update(file_id=file_id,sha256=hashlib.sha256(raw).hexdigest(),original_bytes_match=True)
  target=None
  for _ in range(60):
   candidates=[r for r in cloud.jobs() if r['file_id']==file_id]
   if candidates:
    target=candidates[0]
    if target['state'] in {'awaiting_local_embedding','failed'}:break
   time.sleep(2)
  assert target and target['state']=='awaiting_local_embedding',target
  for _ in range(45):
   if local.get('/api/files/'+file_id).raise_for_status().json()['status']=='indexed':break
   time.sleep(2)
  completed=cloud.complete_jobs(limit=3)
  target=next(r for r in cloud.jobs() if r['file_id']==file_id)
  assert target['state']=='searchable',target
  assert target.get('cloud_extraction')=='approved_plain_text'
  artifact=storage.get_object(Bucket=settings.s3_bucket,Key=target['artifact_key']);content=json.loads(artifact['Body'].read());artifact['Body'].close();assert content['sha256']==report['sha256']
  history=states.get_execution_history(executionArn=out['WorkflowArn'].replace(':stateMachine:',':execution:')+':'+target['correlation_id'],maxResults=100)
  succeeded=any(e['type']=='ExecutionSucceeded' for e in history['events']);assert succeeded
  report.update(cloud_stage='succeeded',local_completion=completed['completed'],job_state=target['state'],cloud_extraction=target['cloud_extraction'],stage_history=target.get('history',[]),workflow_execution_succeeded=succeeded,workflow_history_events=len(history['events']))
  search=local.get('/api/search',params={'q':'How can farms avoid wasting water?' if args.fixture=='water-conservation.txt' else 'Where do MiniLM embeddings and Qwen generation run?','mode':'semantic','top_k':5}).raise_for_status().json()
  assert search['retrieval_backend']['provider']=='s3vectors'
  report['cloud_retrieval']=search['retrieval_backend'];report['retrieved_fixture']=any(r['file']['id']==file_id for r in search['results']);assert report['retrieved_fixture']
  downloaded=local.get('/api/files/'+file_id+'/download').raise_for_status().content;assert downloaded==raw;report['download_bytes_match']=True
 m.update(lambda_verified=True,queue_verified=True,events_verified=True,workflow_verified=True)
 m['operations'].append({'operation':'Real S3 event to searchable document','status':'succeeded','at':datetime.datetime.now(datetime.timezone.utc).isoformat()})
finally:
 events.disable_rule(Name='cloudvault-v3-dev-uploads')
 functions.update_event_source_mapping(UUID=out['MappingId'],Enabled=False)
 m['pipeline_paused']=True;path.write_text(json.dumps(m,indent=2))
 report['event_route_paused']=True;report['finished_at']=datetime.datetime.now(datetime.timezone.utc).isoformat()
 destination='AWS_WATER_RESTORATION_VERIFICATION.json' if args.fixture=='water-conservation.txt' else 'AWS_WORKFLOW_VERIFICATION.json'
 (ROOT/'docs'/destination).write_text(json.dumps(report,indent=2))
 print(json.dumps(report,indent=2),flush=True)
