$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$runtime=Join-Path $root '.runtime'
$binary=Join-Path $runtime 'ollama\ollama.exe'
if(-not(Test-Path $binary)){
    if((Get-PSDrive -Name C).Free -lt 8GB){throw 'At least 8 GiB free disk recommended for runtime installation and model.'}
    New-Item -ItemType Directory -Force "$runtime\ollama" | Out-Null
    $archive=Join-Path $runtime 'ollama-windows-amd64.zip'
    Write-Host 'Installing optional official portable Ollama v0.40.18 (1.72 GB archive).'
    & curl.exe -L --fail --retry 4 --retry-all-errors --continue-at - 'https://github.com/ollama/ollama/releases/download/v0.40.18/ollama-windows-amd64.zip' --output $archive
    if($LASTEXITCODE){throw 'Runtime download failed; rerun to resume.'}
    if((Get-FileHash $archive -Algorithm SHA256).Hash.ToLower() -ne 'ca97292ac1e9acc77fcf473bb2741fa6acd12e3798f261b419680068b7cc4c16'){throw 'Official runtime checksum mismatch'}
    Expand-Archive -LiteralPath $archive -DestinationPath "$runtime\ollama" -Force
}
& "$PSScriptRoot\start-ai.ps1"
Write-Host 'Downloading qwen2.5:3b Q4_K_M, approximately 1.9 GB, Qwen research license. No paid API.'
$env:OLLAMA_HOST='127.0.0.1:11434'
& $binary pull qwen2.5:3b
if($LASTEXITCODE){throw 'Model pull failed; existing cloud storage and semantic search remain available.'}
& $binary show qwen2.5:3b
if($LASTEXITCODE){throw 'Model verification failed'}
Write-Host 'Local model available. Run scripts/warmup.ps1 before the evaluation.'
