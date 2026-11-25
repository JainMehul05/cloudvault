"""Generate/review a bounded CloudFormation change set; apply only with --apply.
No original bucket ownership, no public bucket or paid-account conversion.
"""
import argparse
import datetime
import hashlib
import json
from pathlib import Path
import sys
import time
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT/'backend'))
from app.config import settings

NAME = 'cloudvault-v3-dev'
REGION = 'ap-southeast-2'
ref = lambda name: {'Ref': name}
sub = lambda value: {'Fn::Sub': value}
arn = lambda name: {'Fn::GetAtt': [name, 'Arn']}
worker = (ROOT/'infrastructure/worker.py').read_text()
states = {}
sequence = [('ValidateObject', 'validate'), ('ExtractOrClassify', 'extract'), ('PersistManifest', 'persist'), ('AwaitLocalEmbedding', 'await_embedding')]
for index, (name, action) in enumerate(sequence):
    task = {'Type': 'Task', 'Resource': 'arn:aws:states:::lambda:invoke', 'Parameters': {'FunctionName': '${WorkerFunction.Arn}', 'Payload': {'stage': action, 'job.$': '$'}}, 'OutputPath': '$.Payload', 'TimeoutSeconds': 35, 'Retry': [{'ErrorEquals': ['Lambda.ServiceException','Lambda.TooManyRequestsException'], 'IntervalSeconds': 1, 'MaxAttempts': 2, 'BackoffRate': 2}], 'Catch': [{'ErrorEquals': ['States.ALL'], 'ResultPath': '$.failure', 'Next': 'RecordFailure'}]}
    task.update({'Next': sequence[index+1][0]} if index+1<len(sequence) else {'End': True})
    states[name] = task
states['RecordFailure'] = {'Type': 'Task', 'Resource': 'arn:aws:states:::lambda:invoke', 'Parameters': {'FunctionName': '${WorkerFunction.Arn}', 'Payload': {'stage': 'fail', 'job.$': '$'}}, 'Next': 'Failed'}
states['Failed'] = {'Type': 'Fail', 'Error': 'CloudStageFailed'}
workflow = json.dumps({'StartAt': 'ValidateObject', 'TimeoutSeconds': 120, 'States': states})
trust = lambda service: {'Version':'2012-10-17','Statement':[{'Effect':'Allow','Principal':{'Service':service},'Action':'sts:AssumeRole'}]}
statement = lambda actions, resources: {'Effect':'Allow','Action':actions,'Resource':resources}
resources = {
 'WorkerLogs': {'Type':'AWS::Logs::LogGroup','Properties':{'LogGroupName':'/aws/lambda/'+NAME+'-worker','RetentionInDays':3}},
 'DeadLetterQueue': {'Type':'AWS::SQS::Queue','Properties':{'QueueName':NAME+'-dlq','MessageRetentionPeriod':345600,'SqsManagedSseEnabled':True}},
 'IngestionQueue': {'Type':'AWS::SQS::Queue','Properties':{'QueueName':NAME+'-ingestion','VisibilityTimeout':180,'ReceiveMessageWaitTimeSeconds':20,'MessageRetentionPeriod':86400,'SqsManagedSseEnabled':True,'RedrivePolicy':{'deadLetterTargetArn':arn('DeadLetterQueue'),'maxReceiveCount':3}}},
 'WorkerRole': {'Type':'AWS::IAM::Role','Properties':{'RoleName':NAME+'-worker-role','AssumeRolePolicyDocument':trust('lambda.amazonaws.com'),'Policies':[{'PolicyName':'scoped-document-processing','PolicyDocument':{'Version':'2012-10-17','Statement':[
 statement(['s3:GetObject'],[sub('arn:aws:s3:::${OriginalBucket}/cloudvault/files/*')]),
 statement(['s3:PutObject'],[sub('arn:aws:s3:::${OriginalBucket}/cloudvault/derived/*')]),
 statement(['dynamodb:GetItem','dynamodb:PutItem','dynamodb:UpdateItem','dynamodb:Query'],[sub('arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/${MetadataTable}')]),
 statement(['sqs:ReceiveMessage','sqs:DeleteMessage','sqs:GetQueueAttributes'],[arn('IngestionQueue')]),
 statement(['states:StartExecution'],[sub('arn:aws:states:${AWS::Region}:${AWS::AccountId}:stateMachine:'+NAME+'-workflow')]),
 statement(['logs:CreateLogGroup','logs:CreateLogStream','logs:PutLogEvents'],[sub('arn:aws:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/'+NAME+'-worker'),sub('arn:aws:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/'+NAME+'-worker:*')])
 ]}}]}},
 'WorkerFunction': {'Type':'AWS::Lambda::Function','DependsOn':'WorkerLogs','Properties':{'FunctionName':NAME+'-worker','Runtime':'python3.13','Handler':'index.handler','Role':arn('WorkerRole'),'Timeout':30,'MemorySize':256,'Architectures':['x86_64'],'Code':{'ZipFile':worker},'Environment':{'Variables':{'ORIGINAL_BUCKET':ref('OriginalBucket'),'METADATA_TABLE':ref('MetadataTable'),'WORKFLOW_ARN':sub('arn:aws:states:${AWS::Region}:${AWS::AccountId}:stateMachine:'+NAME+'-workflow'),'APPROVED_FIXTURE_SHA256':ref('FixtureSha')}}}},
 'WorkflowRole': {'Type':'AWS::IAM::Role','Properties':{'RoleName':NAME+'-workflow-role','AssumeRolePolicyDocument':trust('states.amazonaws.com'),'Policies':[{'PolicyName':'invoke-worker-only','PolicyDocument':{'Version':'2012-10-17','Statement':[statement(['lambda:InvokeFunction'],[arn('WorkerFunction')])]}}]}},
 'DocumentWorkflow': {'Type':'AWS::StepFunctions::StateMachine','Properties':{'StateMachineName':NAME+'-workflow','StateMachineType':'STANDARD','RoleArn':arn('WorkflowRole'),'DefinitionString':sub(workflow)}},
 'QueuePolicy': {'Type':'AWS::SQS::QueuePolicy','Properties':{'Queues':[ref('IngestionQueue')],'PolicyDocument':{'Version':'2012-10-17','Statement':[{'Effect':'Allow','Principal':{'Service':'events.amazonaws.com'},'Action':'sqs:SendMessage','Resource':arn('IngestionQueue'),'Condition':{'ArnEquals':{'aws:SourceArn':sub('arn:aws:events:${AWS::Region}:${AWS::AccountId}:rule/'+NAME+'-uploads')},'StringEquals':{'aws:SourceAccount':ref('AWS::AccountId')}}}]}}},
 'UploadRule': {'Type':'AWS::Events::Rule','DependsOn':'QueuePolicy','Properties':{'Name':NAME+'-uploads','State':'DISABLED','EventPattern':{'source':['aws.s3'],'detail-type':['Object Created'],'detail':{'bucket':{'name':[ref('OriginalBucket')]},'object':{'key':[{'prefix':'cloudvault/files/'}]}}},'Targets':[{'Id':'Ingestion','Arn':arn('IngestionQueue')}]}},
 'QueueMapping': {'Type':'AWS::Lambda::EventSourceMapping','Properties':{'FunctionName':ref('WorkerFunction'),'EventSourceArn':arn('IngestionQueue'),'BatchSize':1,'Enabled':False,'FunctionResponseTypes':['ReportBatchItemFailures'],'ScalingConfig':{'MaximumConcurrency':2}}},
 'MetadataApi': {'Type':'AWS::ApiGatewayV2::Api','Properties':{'Name':NAME+'-metadata','ProtocolType':'HTTP','RouteSelectionExpression':'$request.method $request.path'}},
 'ApiIntegration': {'Type':'AWS::ApiGatewayV2::Integration','Properties':{'ApiId':ref('MetadataApi'),'IntegrationType':'AWS_PROXY','IntegrationUri':arn('WorkerFunction'),'PayloadFormatVersion':'2.0','TimeoutInMillis':10000}},
 'ApiStage': {'Type':'AWS::ApiGatewayV2::Stage','Properties':{'ApiId':ref('MetadataApi'),'StageName':'$default','AutoDeploy':True,'DefaultRouteSettings':{'ThrottlingBurstLimit':2,'ThrottlingRateLimit':1}}},
 'ApiPermission': {'Type':'AWS::Lambda::Permission','Properties':{'FunctionName':ref('WorkerFunction'),'Action':'lambda:InvokeFunction','Principal':'apigateway.amazonaws.com','SourceArn':sub('arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${MetadataApi}/*/GET/*')}},
 'TableParameter': {'Type':'AWS::SSM::Parameter','Properties':{'Name':'/cloudvault/v3/dev/table','Type':'String','Tier':'Standard','Value':ref('MetadataTable')}},
 'VectorParameter': {'Type':'AWS::SSM::Parameter','Properties':{'Name':'/cloudvault/v3/dev/vector-index','Type':'String','Tier':'Standard','Value':ref('VectorIndex')}},
 'WorkflowParameter': {'Type':'AWS::SSM::Parameter','Properties':{'Name':'/cloudvault/v3/dev/workflow','Type':'String','Tier':'Standard','Value':NAME+'-workflow'}},
}
for path in ['files','jobs','status']:
 resources[path.title()+'Route']={'Type':'AWS::ApiGatewayV2::Route','Properties':{'ApiId':ref('MetadataApi'),'RouteKey':'GET /'+path,'AuthorizationType':'AWS_IAM','Target':{'Fn::Join':['/', ['integrations',ref('ApiIntegration')]]}}}
template={'AWSTemplateFormatVersion':'2010-09-09','Description':'Approved private CloudVault lab processing; no original bucket ownership; triggers initially paused','Parameters':{'OriginalBucket':{'Type':'String'},'MetadataTable':{'Type':'String'},'VectorIndex':{'Type':'String'},'FixtureSha':{'Type':'String'}},'Resources':resources,'Outputs':{'FunctionName':{'Value':ref('WorkerFunction')},'WorkflowArn':{'Value':ref('DocumentWorkflow')},'QueueUrl':{'Value':ref('IngestionQueue')},'QueueArn':{'Value':arn('IngestionQueue')},'DlqUrl':{'Value':ref('DeadLetterQueue')},'MappingId':{'Value':ref('QueueMapping')},'ApiId':{'Value':ref('MetadataApi')},'ApiEndpoint':{'Value':{'Fn::GetAtt':['MetadataApi','ApiEndpoint']}}}}
(ROOT/'infrastructure/cloudvault-stack.json').write_text(json.dumps(template,indent=2),encoding='utf-8')
parser=argparse.ArgumentParser();parser.add_argument('--apply',action='store_true');args=parser.parse_args()
if not args.apply:
 print('Generated local CloudFormation template. '+str(len(resources))+' bounded resources; no AWS calls.');raise SystemExit()
s=boto3.Session(profile_name='default',region_name=REGION); cfg=Config(connect_timeout=5,read_timeout=20,retries={'max_attempts':1})
plan=s.client('freetier',config=cfg).get_account_plan_state()
assert plan['accountPlanType']=='FREE' and plan['accountPlanStatus']=='ACTIVE' and plan['accountPlanRemainingCredits']['amount']>=1,'Free plan/credit guard rejected deployment'
manifest_path=ROOT/'.runtime/cloud-resources.json';manifest=json.loads(manifest_path.read_text())
def save():manifest_path.write_text(json.dumps(manifest,indent=2,default=str),encoding='utf-8')
cf=s.client('cloudformation',config=cfg)
try:
 parameters=[{'ParameterKey':k,'ParameterValue':v} for k,v in {'OriginalBucket':settings.s3_bucket,'MetadataTable':manifest['table'],'VectorIndex':manifest['vector_index'],'FixtureSha':','.join(hashlib.sha256((ROOT/'samples'/name).read_bytes()).hexdigest() for name in ['cloud-stage-canary.txt','water-conservation.txt'])}.items()]
 changeset=NAME+'-'+str(int(time.time()))
 try:
  existing=cf.describe_stacks(StackName=NAME)['Stacks'][0];kind='UPDATE'
 except ClientError as e:
  if 'does not exist' not in str(e):raise
  kind='CREATE'
 cf.create_change_set(StackName=NAME,ChangeSetName=changeset,ChangeSetType=kind,TemplateBody=json.dumps(template),Parameters=parameters,Capabilities=['CAPABILITY_NAMED_IAM'],Tags=[{'Key':'Project','Value':'CloudVault'},{'Key':'Environment','Value':'lab'}])
 cf.get_waiter('change_set_create_complete').wait(StackName=NAME,ChangeSetName=changeset,WaiterConfig={'Delay':3,'MaxAttempts':40})
 review=cf.describe_change_set(StackName=NAME,ChangeSetName=changeset)
 allowed={r['Type'] for r in resources.values()}
 summary=[{'action':r['ResourceChange']['Action'],'logical_id':r['ResourceChange']['LogicalResourceId'],'type':r['ResourceChange']['ResourceType']} for r in review.get('Changes',[])]
 assert all(r['type'] in allowed and r['action'] in {'Add','Modify'} for r in summary),'Unexpected or destructive change set'
 (ROOT/'docs/AWS_CHANGESET_REVIEW.json').write_text(json.dumps({'reviewed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'changes':summary,'within_approved_manifest':True},indent=2),encoding='utf-8')
 print('Reviewed change set: '+str(len(summary))+' additions/modifications, no deletions.',flush=True)
 # Explicit approved manifest covers these exact resources. Never calls UpgradeAccountPlan.
 cf.execute_change_set(StackName=NAME,ChangeSetName=changeset,DisableRollback=True)
 waiter='stack_create_complete' if kind=='CREATE' else 'stack_update_complete'
 cf.get_waiter(waiter).wait(StackName=NAME,WaiterConfig={'Delay':4,'MaxAttempts':60})
 stack=cf.describe_stacks(StackName=NAME)['Stacks'][0]
 manifest['stack']=NAME;manifest['serverless_outputs']={r['OutputKey']:r['OutputValue'] for r in stack.get('Outputs',[])};manifest['serverless_deployed']=True;save()
 print('Serverless stack deployed. Triggers remain paused pending live test.',flush=True)
except Exception as e:
 manifest['serverless_deploy_error']={'type':type(e).__name__,'private_message':str(e)[:2000]};save()
 print('Serverless deployment blocked or incomplete: '+type(e).__name__+'. Details retained privately; no plan upgrade attempted.',flush=True)
 raise
