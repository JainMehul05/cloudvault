$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$runtime=Join-Path $root '.runtime'
$binary=Join-Path $runtime 'ollama\ollama.exe'
if(-not(Test-Path $binary)){
    $installed=Get-Command ollama -ErrorAction SilentlyContinue
    if($installed){$binary=$installed.Source}else{Write-Host 'Local generation unavailable. Optional setup: scripts/setup-ai.ps1. Search and storage still work.';return}
}
try{$existing=Invoke-RestMethod 'http://127.0.0.1:11434/api/tags' -TimeoutSec 2;Write-Host 'Using existing local Ollama runtime.';return}catch{}
if(Get-NetTCPConnection -LocalPort 11434 -State Listen -ErrorAction SilentlyContinue){throw 'Port 11434 is occupied by an unrecognized service. No process was changed.'}
New-Item -ItemType Directory -Force $runtime | Out-Null
$modelPath=Join-Path $root 'data\ollama-models'
New-Item -ItemType Directory -Force $modelPath | Out-Null
$variables=@{OLLAMA_HOST='127.0.0.1:11434';OLLAMA_MODELS=$modelPath;OLLAMA_NO_CLOUD='1';OLLAMA_NUM_PARALLEL='1';OLLAMA_MAX_LOADED_MODELS='1';OLLAMA_CONTEXT_LENGTH='6144';OLLAMA_KEEP_ALIVE='5m'}
$previous=@{}
try{
    foreach($key in $variables.Keys){$previous[$key]=[Environment]::GetEnvironmentVariable($key,'Process');[Environment]::SetEnvironmentVariable($key,$variables[$key],'Process')}
    $process=Start-Process -FilePath $binary -ArgumentList 'serve' -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput "$runtime\ai.log" -RedirectStandardError "$runtime\ai-error.log" -PassThru
}finally{foreach($key in $variables.Keys){[Environment]::SetEnvironmentVariable($key,$previous[$key],'Process')}}
@{pid=$process.Id;started=$process.StartTime.ToUniversalTime().ToString('o');executable=$binary} | ConvertTo-Json | Set-Content "$runtime\ai-server.json"
$ready=$false
for($attempt=0;$attempt -lt 50;$attempt++){
    if($process.HasExited){throw 'Ollama exited; inspect .runtime/ai-error.log'}
    try{$null=Invoke-RestMethod 'http://127.0.0.1:11434/api/tags' -TimeoutSec 2;$ready=$true;break}catch{Start-Sleep -Milliseconds 400}
}
if(-not $ready){throw 'Local AI runtime did not become ready'}
Write-Host 'Local Ollama ready on 127.0.0.1:11434. No cloud inference.'
