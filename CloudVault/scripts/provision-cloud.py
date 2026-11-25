"""Approved bounded CloudVault provisioning. Dry-run unless --apply; never deletes data."""
import argparse
import datetime
import json
from pathlib import Path
import secrets
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--apply', action='store_true')
args = parser.parse_args()
manifest_path = ROOT / '.runtime/cloud-resources.json'
manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {
    'region': 'ap-southeast-2', 'table': 'cloudvault-v3-dev',
    'vector_bucket': 'cloudvault-v3-dev-vectors-' + secrets.token_hex(4),
    'vector_index': 'minilm-384-v1',
    'approval': 'User approved consolidated plan including IAM-protected API Gateway on 2026-11-24',
    'operations': [],
}
if not args.apply:
    print(json.dumps({k: v for k, v in manifest.items() if k != 'operations'}, indent=2))
    print('Dry-run only. No AWS calls or resources changed.')
    raise SystemExit()

session = boto3.Session(profile_name='default', region_name=manifest['region'])
config = Config(connect_timeout=5, read_timeout=20, retries={'max_attempts': 1})
plan = session.client('freetier', config=config).get_account_plan_state()
if plan['accountPlanType'] != 'FREE' or plan['accountPlanStatus'] != 'ACTIVE' or plan['accountPlanRemainingCredits']['amount'] < 1:
    raise SystemExit('Free plan/credit guard rejected provisioning. No account upgrade is allowed.')
manifest_path.parent.mkdir(exist_ok=True)

def save():
    manifest_path.write_text(json.dumps(manifest, indent=2, default=str), encoding='utf-8')

def operation(label, action):
    try:
        result = action()
        manifest['operations'].append({'operation': label, 'at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'status': 'succeeded', 'request_id': result.get('ResponseMetadata', {}).get('RequestId') if isinstance(result, dict) else None})
        save(); print(label + ': succeeded', flush=True)
        return result
    except ClientError as error:
        code = error.response['Error']['Code']
        manifest['operations'].append({'operation': label, 'at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'status': 'blocked', 'error_code': code, 'private_message': error.response['Error'].get('Message')})
        save(); print(label + ': ' + code, flush=True)
        return None

save()
vectors = session.client('s3vectors', config=config)
if not manifest.get('vector_bucket_created'):
    result = operation('CreateVectorBucket', lambda: vectors.create_vector_bucket(vectorBucketName=manifest['vector_bucket'], tags={'Project': 'CloudVault', 'Environment': 'lab'}))
    if result is not None: manifest['vector_bucket_created'] = True; save()
if manifest.get('vector_bucket_created') and not manifest.get('vector_index_created'):
    result = operation('CreateIndex', lambda: vectors.create_index(vectorBucketName=manifest['vector_bucket'], indexName=manifest['vector_index'], dataType='float32', dimension=384, distanceMetric='cosine', tags={'Project': 'CloudVault', 'Environment': 'lab'}))
    if result is not None: manifest['vector_index_created'] = True; save()
if manifest.get('vector_index_created') and not manifest.get('vector_canary_verified'):
    scope = {'vectorBucketName': manifest['vector_bucket'], 'indexName': manifest['vector_index']}
    samples = []
    for i in range(3):
        values = [0.0] * 384; values[i] = 1.0
        samples.append({'key': f'canary:{i}', 'data': {'float32': values}, 'metadata': {'scope': 'canary', 'model': 'synthetic-basis'}})
    result = operation('PutVectors canary', lambda: vectors.put_vectors(**scope, vectors=samples))
    if result is not None:
        query = operation('QueryVectors canary', lambda: vectors.query_vectors(**scope, queryVector=samples[0]['data'], topK=3, returnMetadata=True, returnDistance=True, filter={'scope': {'$eq': 'canary'}}))
        read = operation('GetVectors canary', lambda: vectors.get_vectors(**scope, keys=['canary:0'], returnData=True, returnMetadata=True))
        listed = operation('ListVectors canary', lambda: vectors.list_vectors(**scope, maxResults=10))
        if query and read and listed:
            assert query['distanceMetric'] == 'cosine'
            assert query['vectors'][0]['key'] == 'canary:0' and abs(query['vectors'][0]['distance']) < .001
            assert read['vectors'][0]['data']['float32'] == samples[0]['data']['float32']
            manifest['vector_canary_verified'] = True; save()

db = session.client('dynamodb', config=config)
if not manifest.get('table_created'):
    result = operation('CreateTable', lambda: db.create_table(TableName=manifest['table'], BillingMode='PAY_PER_REQUEST', AttributeDefinitions=[{'AttributeName': 'pk', 'AttributeType': 'S'}, {'AttributeName': 'sk', 'AttributeType': 'S'}], KeySchema=[{'AttributeName': 'pk', 'KeyType': 'HASH'}, {'AttributeName': 'sk', 'KeyType': 'RANGE'}], Tags=[{'Key': 'Project', 'Value': 'CloudVault'}, {'Key': 'Environment', 'Value': 'lab'}]))
    if result is not None: manifest['table_created'] = True; save()
if manifest.get('table_created') and not manifest.get('metadata_canary_verified'):
    db.get_waiter('table_exists').wait(TableName=manifest['table'], WaiterConfig={'Delay': 2, 'MaxAttempts': 30})
    item = {'pk': {'S': 'WORKSPACE#default'}, 'sk': {'S': 'CANARY'}, 'revision': {'N': '1'}, 'purpose': {'S': 'non-sensitive live canary'}}
    result = operation('PutItem conditional canary', lambda: db.put_item(TableName=manifest['table'], Item=item, ConditionExpression='attribute_not_exists(pk)'))
    if result is not None:
        read = operation('GetItem consistent canary', lambda: db.get_item(TableName=manifest['table'], Key={k: item[k] for k in ['pk', 'sk']}, ConsistentRead=True))
        if read:
            assert read['Item']['revision']['N'] == '1'
            manifest['metadata_canary_verified'] = True; save()
print('Canary results: vectors=' + str(manifest.get('vector_canary_verified', False)) + ', metadata=' + str(manifest.get('metadata_canary_verified', False)))
