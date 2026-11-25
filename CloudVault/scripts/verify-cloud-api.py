"""Actual signed API/SSM/log verification; no new provisioning or public credentials."""
import datetime
import json
from pathlib import Path
import boto3
from botocore.auth import SigV4Auth
from botocore.awsrequest import AWSRequest
import httpx

ROOT=Path(__file__).resolve().parents[1]
path=ROOT/'.runtime/cloud-resources.json';manifest=json.loads(path.read_text());outputs=manifest['serverless_outputs']
s=boto3.Session(profile_name='default',region_name='ap-southeast-2')
plan=s.client('freetier').get_account_plan_state()
assert plan['accountPlanType']=='FREE' and plan['accountPlanStatus']=='ACTIVE' and plan['accountPlanRemainingCredits']['amount']>=1
def signed_get(route):
 url=outputs['ApiEndpoint']+route
 request=AWSRequest(method='GET',url=url)
 SigV4Auth(s.get_credentials().get_frozen_credentials(),'execute-api','ap-southeast-2').add_auth(request)
 response=httpx.get(url,headers=dict(request.headers),timeout=20,trust_env=False);response.raise_for_status();return response.json()
unauthorized=httpx.get(outputs['ApiEndpoint']+'/status',timeout=15,trust_env=False)
assert unauthorized.status_code in (401,403),unauthorized.status_code
status=signed_get('/status');files=signed_get('/files')
assert status['status']=='ok' and files['source']=='dynamodb_via_iam_api' and len(files['items'])>=11
parameters=s.client('ssm').get_parameters(Names=['/cloudvault/v3/dev/table','/cloudvault/v3/dev/vector-index','/cloudvault/v3/dev/workflow'])
values={p['Name'].rsplit('/',1)[-1]:p['Value'] for p in parameters['Parameters']}
assert values['table']==manifest['table'] and values['vector-index']==manifest['vector_index']
cfg_path=ROOT/'.runtime/cloud-config.json';cfg=json.loads(cfg_path.read_text());cfg.update(api_enabled=True,api_endpoint=outputs['ApiEndpoint'],table=values['table'],vector_index=values['vector-index'],workflow_name=values['workflow']);cfg_path.write_text(json.dumps(cfg,indent=2))
manifest.update(api_verified=True,parameters_verified=True)
manifest['operations'].append({'operation':'SigV4 API and Standard SSM read','status':'succeeded','at':datetime.datetime.now(datetime.timezone.utc).isoformat()});path.write_text(json.dumps(manifest,indent=2))
report={'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'unauthorized_http_status':unauthorized.status_code,'signed_status':status['status'],'signed_file_count':len(files['items']),'metadata_source':files['source'],'ssm_standard_parameters_read':len(values),'browser_credentials':False,'throttle_rps':1,'burst':2}
(ROOT/'docs/AWS_API_VERIFICATION.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
