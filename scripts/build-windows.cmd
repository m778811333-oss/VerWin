@echo off
setlocal
call npm ci || exit /b 1
call npm test || exit /b 1
call npm run desktop:dist || exit /b 1
echo Artifacts are in release\
