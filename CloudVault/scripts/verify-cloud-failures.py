"""Isolated negative canaries; no user object is changed/deleted; triggers stay paused."""
import datetime
import json
from pathlib import Path
import time
from uuid import uuid4
import boto3

ROOT=Path(__file__).resolve().parents[1];path=ROOT/'.runtime/cloud-resources.json';m=json.loads(path.read_text());out=m['serverless_outputs']
s=boto3.Session(profile_name='default',region_name='ap-southeast-2')
plan=s.client('freetier').get_account_plan_state();assert plan['accountPlanType']=='FREE' and plan['accountPlanStatus']=='ACTIVE' and plan['accountPlanRemainingCredits']['amount']>1
functions=s.client('lambda');events=s.client('events');queues=s.client('sqs');states=s.client('stepfunctions')
assert events.describe_rule(Name='cloudvault-v3-dev-uploads')['State']=='DISABLED'
assert functions.get_event_source_mapping(UUID=out['MappingId'])['State']=='Disabled'
bad=json.dumps({'detail':{'bucket':{'name':'unmanaged-test-bucket'},'object':{'key':'invalid'}}})
invoked=functions.invoke(FunctionName=out['FunctionName'],Payload=json.dumps({'Records':[{'body':bad,'messageId':'isolated-negative-canary'}]}).encode())
response=json.loads(invoked['Payload'].read());assert response['batchItemFailures']==[{'itemIdentifier':'isolated-negative-canary'}]
report={'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'deployed_lambda_partial_failure_verified':True,'original_objects_changed':False,'event_mapping_paused':True}
attributes=queues.get_queue_attributes(QueueUrl=out['QueueUrl'],AttributeNames=['ApproximateNumberOfMessages','ApproximateNumberOfMessagesNotVisible'])['Attributes']
if any(int(v) for v in attributes.values()):
 report['dlq_redrive']='skipped: queue is not empty; no unrelated message touched'
else:
 token='cloudvault-negative-'+uuid4().hex
 queues.send_message(QueueUrl=out['QueueUrl'],MessageBody=json.dumps({'test_fixture':True,'token':token}))
 receives=[]
 for _ in range(10):
  result=queues.receive_message(QueueUrl=out['QueueUrl'],MaxNumberOfMessages=1,WaitTimeSeconds=1,MessageSystemAttributeNames=['ApproximateReceiveCount'])
  for message in result.get('Messages',[]):
   if json.loads(message['Body']).get('token')!=token:raise RuntimeError('Unexpected message; no acknowledgement performed')
   receives.append(int(message['Attributes']['ApproximateReceiveCount']));queues.change_message_visibility(QueueUrl=out['QueueUrl'],ReceiptHandle=message['ReceiptHandle'],VisibilityTimeout=0)
  if len(receives)>=3:break
 # Next receive allows the configured redrive policy to move the exhausted message.
 queues.receive_message(QueueUrl=out['QueueUrl'],MaxNumberOfMessages=1,WaitTimeSeconds=1)
 delivered=False
 for _ in range(10):
  result=queues.receive_message(QueueUrl=out['DlqUrl'],MaxNumberOfMessages=1,WaitTimeSeconds=1)
  if any(json.loads(message['Body']).get('token')==token for message in result.get('Messages',[])):delivered=True;break
 assert delivered,'Synthetic message did not reach DLQ in bounded check'
 report.update(dlq_redrive='live_verified',synthetic_receive_counts=receives,dlq_test_message_retained=True,redrive_test_driver='bounded local SQS receives; deployed Lambda rejection was tested separately')
file_id=str(uuid4());name='negative-'+uuid4().hex
job={'file_id':file_id,'bucket':None,'key':'cloudvault/files/'+file_id+'/missing-non-sensitive-canary.txt','job_key':'JOB#'+name,'correlation_id':name,'created_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'test_fixture':True}
import sys;sys.path.insert(0,str(ROOT/'backend'))
from app.config import settings
job['bucket']=settings.s3_bucket
execution=states.start_execution(stateMachineArn=out['WorkflowArn'],name=name,input=json.dumps(job))
for _ in range(30):
 result=states.describe_execution(executionArn=execution['executionArn'])
 if result['status']!='RUNNING':break
 time.sleep(1)
assert result['status']=='FAILED',result['status']
report['workflow_catch_and_terminal_failure']='live_verified'
(ROOT/'docs/AWS_FAILURE_VERIFICATION.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
