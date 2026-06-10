# One-time: authorize this PC's SSH key on the VPS (enter root password when prompted)
$pubKey = Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub" -ErrorAction Stop
$host = "144.91.111.35"
$user = "root"

Write-Host "Adding SSH key to ${user}@${host}..." -ForegroundColor Cyan
Write-Host "Enter VPS root password when prompted." -ForegroundColor Yellow

$cmd = @"
mkdir -p ~/.ssh && chmod 700 ~/.ssh && 
grep -qF '$pubKey' ~/.ssh/authorized_keys 2>/dev/null || echo '$pubKey' >> ~/.ssh/authorized_keys && 
chmod 600 ~/.ssh/authorized_keys && echo KEY_OK
"@

ssh -o StrictHostKeyChecking=accept-new "${user}@${host}" $cmd

if ($LASTEXITCODE -eq 0) {
  Write-Host "SSH key installed. Test: ssh getindexrocket-vps" -ForegroundColor Green
} else {
  Write-Host "Failed. Run manually from VPS:" -ForegroundColor Red
  Write-Host $pubKey
}
