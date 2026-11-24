$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
try { & "$PSScriptRoot\start-ai.ps1" } catch { Write-Warning "Local generation unavailable: $($_.Exception.Message). Extractive fallback remains available." }
$python = Join-Path $root 'backend\.venv\Scripts\python.exe'
if (-not (Test-Path $python)) { throw 'Run scripts/setup.ps1 first.' }
if (-not (Test-Path "$root\frontend\dist\index.html")) { throw 'Frontend build missing. Run scripts/setup.ps1.' }
$runtime = Join-Path $root '.runtime'
New-Item -ItemType Directory -Force $runtime | Out-Null
$statePath = Join-Path $runtime 'server.json'
if (Test-Path $statePath) {
 $state = Get-Content $statePath | ConvertFrom-Json
 $existing = Get-Process -Id $state.pid -ErrorAction SilentlyContinue
 if ($existing -and $existing.StartTime.ToUniversalTime().Ticks -eq ([datetime]$state.started).ToUniversalTime().Ticks) { Write-Host 'CloudVault already running at http://127.0.0.1:8000'; exit 0 }
}
if (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue) { throw 'Port 8000 is already in use. No existing process was stopped.' }
$process = Start-Process -FilePath $python -ArgumentList @('-m','uvicorn','app.main:app','--host','127.0.0.1','--port','8000','--no-access-log') -WorkingDirectory "$root\backend" -WindowStyle Hidden -RedirectStandardOutput "$runtime\server.log" -RedirectStandardError "$runtime\server-error.log" -PassThru
@{pid=$process.Id;started=$process.StartTime.ToUniversalTime().ToString('o');executable=$python} | ConvertTo-Json | Set-Content $statePath
$ready=$false
for($attempt=0;$attempt -lt 40;$attempt++) {
 if ($process.HasExited) { Get-Content "$runtime\server-error.log"; throw 'CloudVault exited during startup.' }
 try { $health=Invoke-RestMethod 'http://127.0.0.1:8000/api/health' -TimeoutSec 2; if($health.status -eq 'ok'){$ready=$true;break} } catch { Start-Sleep -Milliseconds 500 }
}
if(-not $ready){throw 'CloudVault did not become healthy. Inspect .runtime logs.'}
Write-Host 'CloudVault: http://127.0.0.1:8000'
Write-Host 'API docs: http://127.0.0.1:8000/docs'
Write-Host 'One local server serves the production React build and REST API.'
