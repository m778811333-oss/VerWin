$ErrorActionPreference = 'Stop'
Write-Host 'VerWin Windows build' -ForegroundColor Cyan
npm ci
npm test
npm run desktop:dist
Write-Host 'Artifacts are in .\release' -ForegroundColor Green
