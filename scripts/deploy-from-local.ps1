# Deploy GetindexRocket to VPS from local Windows (requires SSH key — run setup-ssh-key.ps1 first)
$ErrorActionPreference = "Stop"
$hostAlias = "getindexrocket-vps"
$localEnv = Join-Path $PSScriptRoot ".." ".env" | Resolve-Path -ErrorAction SilentlyContinue

Write-Host "Deploying to $hostAlias ..." -ForegroundColor Cyan

ssh -o BatchMode=yes -o ConnectTimeout=20 $hostAlias "bash <(curl -fsSL 'https://raw.githubusercontent.com/advanceseoacademy/getindexrocket/main/scripts/vps-remote-deploy.sh')"
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "SSH failed. Run once: powershell -File scripts/setup-ssh-key.ps1" -ForegroundColor Yellow
  exit 1
}

if ($localEnv) {
  Write-Host "Uploading local .env ..." -ForegroundColor Cyan
  scp -o BatchMode=yes $localEnv "${hostAlias}:/var/www/getindexrocket/.env"
  ssh -o BatchMode=yes $hostAlias "cd /var/www/getindexrocket && bash scripts/vps-deploy.sh"
}

Write-Host "Checking production health ..." -ForegroundColor Cyan
curl.exe -sS "https://getindexrocket.com/api/health"
Write-Host ""
