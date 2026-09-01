param(
  [string]$Repo = "https://github.com/ehsanef/C1-proxy.git"
)

$ErrorActionPreference = "Stop"
Write-Host "C1 Proxy - publish to GitHub" -ForegroundColor Cyan

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Git is not installed or not available in PATH. Install Git for Windows first."
}

if (-not (Test-Path "package.json")) {
  throw "Run this script from the extracted C1-proxy folder."
}

if (-not (Test-Path ".git")) {
  git init
}

git branch -M main
git add .

$hasCommit = $true
try { git rev-parse --verify HEAD *> $null } catch { $hasCommit = $false }

if (-not $hasCommit) {
  git commit -m "Initial C1 Proxy public beta"
} else {
  $changes = git status --porcelain
  if ($changes) { git commit -m "Update C1 Proxy" }
}

$originExists = $false
try { git remote get-url origin *> $null; $originExists = $true } catch {}
if ($originExists) { git remote set-url origin $Repo } else { git remote add origin $Repo }

Write-Host "Pushing to $Repo ..." -ForegroundColor Yellow
git push -u origin main

Write-Host "Done. Open: https://github.com/ehsanef/C1-proxy" -ForegroundColor Green
Write-Host "The Deploy to Cloudflare button in README will work once the repository is public." -ForegroundColor Green
