"""Read-only local benchmarks. Never uploads, reindexes or deletes originals."""
import json
import statistics
import sys
import time
from pathlib import Path
import httpx

root=Path(__file__).resolve().parents[1]
label=sys.argv[1] if len(sys.argv)>1 else 'v2'
client=httpx.Client(base_url='http://127.0.0.1:8000',timeout=180)
report={'label':label,'health':client.get('/api/health').raise_for_status().json(),'latency_ms':{}}
for name,path,params in [('health','/api/health',{}),('list','/api/files',{}),('keyword','/api/search',{'q':'remotely managed','mode':'keyword'}),('semantic','/api/search',{'q':'Where can I store my digital files remotely?','mode':'semantic'}),('hybrid','/api/search',{'q':'cloud storage','mode':'hybrid'})]:
    values=[]
    for _ in range(6):
        start=time.perf_counter();response=client.get(path,params=params);response.raise_for_status();values.append((time.perf_counter()-start)*1000)
    report['latency_ms'][name]={'first':round(values[0],2),'warm_median':round(statistics.median(values[1:]),2),'warm_max':round(max(values[1:]),2)}
(root/'docs'/('BENCHMARK_'+label.upper()+'.json')).write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
