param([ValidateSet('check','start','stop','health')][string]$Action = 'check')
$ErrorActionPreference = 'Stop'
if ($Action -eq 'check') {
  docker version | Out-Null
  docker compose version | Out-Null
  docker compose config --quiet
} elseif ($Action -eq 'start') {
  if (-not $env:FORGE_ADMIN_PASSWORD_HASH) { throw 'Set FORGE_ADMIN_PASSWORD_HASH; see docs/PRIVATE_HOST_DEPLOYMENT.md' }
  docker compose up -d --build forge-studio preview-browser
} elseif ($Action -eq 'stop') {
  docker compose stop forge-studio preview-browser
} else {
  Invoke-RestMethod -Uri 'http://127.0.0.1:8080/health'
}
