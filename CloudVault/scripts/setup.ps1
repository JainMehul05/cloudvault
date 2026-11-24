$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
foreach ($tool in @('uv','node','npm','aws')) { if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) { throw "$tool is required" } }
if (-not (Test-Path "$root\backend\.venv\Scripts\python.exe")) { & uv venv --python 3.13 "$root\backend\.venv"; if ($LASTEXITCODE) { throw 'Python environment failed' } }
& uv pip sync --python "$root\backend\.venv\Scripts\python.exe" "$root\backend\requirements.lock" --torch-backend cpu
if ($LASTEXITCODE) { throw 'Backend dependencies failed' }
Push-Location "$root\frontend"
try { & npm.cmd ci; if ($LASTEXITCODE) { throw 'Frontend dependencies failed' }; & npm.cmd run build; if ($LASTEXITCODE) { throw 'Frontend build failed' } } finally { Pop-Location }
if (-not (Test-Path "$root\.env")) { Copy-Item "$root\.env.example" "$root\.env" }
Push-Location "$root\backend"
try { & .venv\Scripts\python.exe -c "from app.database import initialize; from app.embeddings import engine; from app.storage import diagnostics; initialize(); print('Embedding dimension:', engine.encode(['CloudVault model check']).shape[1]); print(diagnostics())"; if ($LASTEXITCODE) { throw 'Model or AWS check failed. If expired, run aws login --profile default, then rerun setup.' } } finally { Pop-Location }
Write-Host 'CloudVault setup verified. Run .\scripts\start.ps1'
