@echo off
cd /d "%~dp0"
echo Stopping CodeXLab Website...
docker compose down
pause
