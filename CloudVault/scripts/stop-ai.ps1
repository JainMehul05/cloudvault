$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$path=Join-Path $root '.runtime\ai-server.json'
if(-not(Test-Path $path)){Write-Host 'No CloudVault-owned AI runtime recorded.';return}
$state=Get-Content $path | ConvertFrom-Json
$process=Get-Process -Id $state.pid -ErrorAction SilentlyContinue
if($process){
    if($process.StartTime.ToUniversalTime().Ticks -ne ([datetime]$state.started).ToUniversalTime().Ticks){throw 'AI PID was reused; refusing unrelated process.'}
    if($process.Path -ne $state.executable){throw 'AI executable mismatch; refusing unrelated process.'}
    Stop-Process -Id $process.Id
}
Remove-Item -LiteralPath $path
Write-Host 'Owned AI runtime stopped; model weights preserved.'
