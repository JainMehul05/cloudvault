"""Bounded read-only AWS eligibility inventory. Never creates or changes resources."""
import concurrent.futures
import datetime
import json
from pathlib import Path
import sys
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'backend'))
from app.config import settings

session = boto3.Session(profile_name='default', region_name='ap-southeast-2')
config = Config(connect_timeout=5, read_timeout=10, retries={'max_attempts': 0})
bucket = settings.s3_bucket
calls = [
    ('identity', 'sts', 'get_caller_identity', {}),
    ('plan', 'freetier', 'get_account_plan_state', {}),
    ('bucket_location', 's3', 'get_bucket_location', {'Bucket': bucket}),
    ('bucket_encryption', 's3', 'get_bucket_encryption', {'Bucket': bucket}),
    ('public_access', 's3', 'get_public_access_block', {'Bucket': bucket}),
    ('notifications', 's3', 'get_bucket_notification_configuration', {'Bucket': bucket}),
    ('vectors', 's3vectors', 'list_vector_buckets', {'maxResults': 10}),
    ('metadata', 'dynamodb', 'list_tables', {'Limit': 10}),
    ('compute', 'lambda', 'list_functions', {'MaxItems': 10}),
    ('logs', 'logs', 'describe_log_groups', {'limit': 10}),
    ('api', 'apigatewayv2', 'get_apis', {'MaxResults': '10'}),
    ('queue', 'sqs', 'list_queues', {'MaxResults': 10}),
    ('events', 'events', 'list_rules', {'Limit': 10}),
    ('workflow', 'stepfunctions', 'list_state_machines', {'maxResults': 10}),
    ('notifications_topic', 'sns', 'list_topics', {}),
    ('parameters', 'ssm', 'describe_parameters', {'MaxResults': 5}),
    ('infrastructure', 'cloudformation', 'list_stacks', {'StackStatusFilter': ['CREATE_COMPLETE', 'UPDATE_COMPLETE']}),
]

def run(call):
    label, service, operation, args = call
    try:
        response = getattr(session.client(service, config=config), operation)(**args)
        response.pop('ResponseMetadata', None)
        return label, {'service': service, 'operation': operation, 'read': 'succeeded', 'response': response, 'provision': 'not attempted', 'write': 'not attempted', 'invoke': 'not attempted'}
    except ClientError as error:
        return label, {'service': service, 'operation': operation, 'read': 'blocked', 'error_code': error.response['Error']['Code'], 'message': error.response['Error'].get('Message', ''), 'provision': 'not attempted'}
    except Exception as error:
        return label, {'service': service, 'operation': operation, 'read': 'failed', 'error_type': type(error).__name__, 'provision': 'not attempted'}

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    results = dict(pool.map(run, calls))
report = {'checked_at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'region': 'ap-southeast-2', 'profile': 'default', 'results': results}
private = ROOT / '.runtime/aws-preflight.json'
private.parent.mkdir(exist_ok=True)
private.write_text(json.dumps(report, indent=2, default=str), encoding='utf-8')
# Public-facing summary omits identifiers, raw messages and resource names.
summary = {'checked_at': report['checked_at'], 'region': report['region'], 'results': {key: {k: v for k, v in value.items() if k not in ('response', 'message')} for key, value in results.items()}}
plan = results['plan'].get('response', {})
summary['plan'] = {key: value for key, value in plan.items() if key != 'accountId'}
(ROOT / 'docs/AWS_PREFLIGHT.json').write_text(json.dumps(summary, indent=2, default=str), encoding='utf-8')
print(json.dumps(summary, indent=2, default=str))
