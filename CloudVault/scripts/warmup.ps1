$ErrorActionPreference='Stop'
& "$PSScriptRoot\start-ai.ps1"
$body=@{model='qwen2.5:3b';messages=@(@{role='user';content='Reply with READY.'});stream=$false;keep_alive='5m';options=@{num_ctx=6144;num_thread=4;num_predict=8;temperature=0}} | ConvertTo-Json -Depth 5
$result=Invoke-RestMethod 'http://127.0.0.1:11434/api/chat' -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 300
Write-Host $result.message.content
Write-Host 'Local model warmup completed.'
try {
    $null=Invoke-RestMethod 'http://127.0.0.1:8000/api/search?q=document&mode=semantic&top_k=1' -TimeoutSec 180
    Write-Host 'MiniLM retrieval warmup completed.'
} catch { Write-Host 'Start CloudVault before warming retrieval; the next search will load MiniLM.' }
