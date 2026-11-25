"""Predefined cases, actual cloud requests and local-vector comparison; no corpus changes."""
import json
from pathlib import Path
import sys
import time
import httpx

ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'backend'))
from app.retrieval import snapshot,_query
from app.config import settings
cases=json.loads((ROOT/'samples/expected_queries.json').read_text())+json.loads((ROOT/'samples/extended_queries.json').read_text())
rows,matrix=snapshot();report=[]
with httpx.Client(base_url='http://127.0.0.1:8000',timeout=180) as c:
 for case in cases:
  start=time.perf_counter();result=c.get('/api/search',params={'q':case['query'],'mode':'semantic','top_k':5}).raise_for_status().json()
  request_ms=round((time.perf_counter()-start)*1000,2)
  names=[r['file']['original_name'] for r in result['results']];rank=names.index(case['expected'])+1 if case['expected'] in names else None
  vector=_query(settings.embedding_model,case['query']);scores=matrix@vector;files={}
  for row,score in zip(rows,scores):
   if score>=.25:files[row['original_name']]=max(float(score),files.get(row['original_name'],-1))
  local=sorted(files,key=files.get,reverse=True)[:5];localrank=local.index(case['expected'])+1 if case['expected'] in local else None
  report.append({**case,'cloud_rank':rank,'local_rank':localrank,'cloud_backend':result['retrieval_backend'],'request_ms':request_ms,'cloud_results':names})
summary={'cases':report,'sample_size':len(report),'cloud_top1':sum(r['cloud_rank']==1 for r in report)/len(report),'cloud_recall_at5':sum(r['cloud_rank'] is not None for r in report)/len(report),'cloud_mrr_at5':sum(1/r['cloud_rank'] if r['cloud_rank'] else 0 for r in report)/len(report),'local_top1':sum(r['local_rank']==1 for r in report)/len(report),'note':'Small curated academic set; not a general accuracy claim. Local rankings computed from the same stored normalized vectors.'}
(ROOT/'docs/RETRIEVAL_EVALUATION_V3.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary,indent=2))
