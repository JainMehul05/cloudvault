$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$statePath = Join-Path $root '.runtime\server.json'
if(-not(Test-Path $statePath)){Write-Host 'No CloudVault-owned server recorded.';exit 0}
$state=Get-Content $statePath | ConvertFrom-Json
$process=Get-Process -Id $state.pid -ErrorAction SilentlyContinue
if($process){
 if($process.StartTime.ToUniversalTime().Ticks -ne ([datetime]$state.started).ToUniversalTime().Ticks){throw 'PID was reused; refusing to stop unrelated process.'}
 if($process.Path -ne $state.executable){throw 'Executable mismatch; refusing to stop unrelated process.'}
 Stop-Process -Id $process.Id
 $process.WaitForExit(10000) | Out-Null
}
Remove-Item -LiteralPath $statePath
Write-Host 'CloudVault server stopped. Files, S3 originals and local index preserved.'
