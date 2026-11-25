"""One bounded native metrics/log snapshot. No Insights, custom metrics or polling loop."""
import datetime
import json
from pathlib import Path
import boto3
from botocore.config import Config

ROOT=Path(__file__).resolve().parents[1]
path=ROOT/'.runtime/cloud-resources.json';m=json.loads(path.read_text());out=m['serverless_outputs']
s=boto3.Session(profile_name='default',region_name='ap-southeast-2')
end=datetime.datetime.now(datetime.timezone.utc);start=end-datetime.timedelta(minutes=30)
c=s.client('cloudwatch',config=Config(connect_timeout=5,read_timeout=10,retries={'max_attempts':1}))
metrics={}
for name,stat in [('Invocations','Sum'),('Errors','Sum'),('Duration','Average')]:
 r=c.get_metric_statistics(Namespace='AWS/Lambda',MetricName=name,Dimensions=[{'Name':'FunctionName','Value':out['FunctionName']}],StartTime=start,EndTime=end,Period=300,Statistics=[stat])
 metrics[name]={'datapoints':[{k:v.isoformat() if isinstance(v,datetime.datetime) else v for k,v in d.items()} for d in r.get('Datapoints',[])],'statistic':stat}
events=[]
logs=s.client('logs',config=Config(connect_timeout=5,read_timeout=10,retries={'max_attempts':1}))
request={'logGroupName':'/aws/lambda/'+out['FunctionName'],'startTime':int(start.timestamp()*1000),'limit':50}
for _ in range(2):
 result=logs.filter_log_events(**request)
 for e in result.get('events',[]):
  try:message=json.loads(e['message'])
  except ValueError:continue
  if 'stage' in message:events.append({'timestamp':e['timestamp'],**{k:v for k,v in message.items() if k in {'stage','correlation_id','duration_ms','request_id'}}})
 if not result.get('nextToken'):break
 request['nextToken']=result['nextToken']
report={'checked_at':end.isoformat(),'window_minutes':30,'native_lambda_metrics':metrics,'safe_structured_log_events':events,'metric_delay_note':'No datapoints means not yet available, not zero usage.'}
(ROOT/'docs/AWS_MONITORING_VERIFICATION.json').write_text(json.dumps(report,indent=2));(ROOT/'.runtime/cloud-monitoring.json').write_text(json.dumps(report,indent=2))
if events:m['logs_verified']=True
if any(v['datapoints'] for v in metrics.values()):m['metrics_verified']=True
path.write_text(json.dumps(m,indent=2))
print(json.dumps({'structured_log_events':len(events),'native_metric_datapoints':{k:len(v['datapoints']) for k,v in metrics.items()}}))
