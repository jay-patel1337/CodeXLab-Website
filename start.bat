@echo off
setlocal EnableDelayedExpansion
title CodeXLab Website - Docker
cd /d "%~dp0"

set "PORT=3000"
set "URL=http://localhost:%PORT%"

echo.
echo   ^<X/^>  CodeXLab Website
echo   ------------------------------
echo.

:: 1. Docker installed?
where docker >nul 2>&1
if errorlevel 1 (
  echo [x] Docker is not installed. Get Docker Desktop: https://www.docker.com/products/docker-desktop/
  goto :fail
)

:: 2. Docker running? If not, start Docker Desktop and wait (max ~3 min)
docker info >nul 2>&1
if not errorlevel 1 goto :docker_ready

echo [..] Docker is not running. Starting Docker Desktop...
if not exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" (
  echo [x] Could not find Docker Desktop. Start it manually, then run start.bat again.
  goto :fail
)
start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
set /a tries=0

:wait_docker
ping -n 4 127.0.0.1 >nul
docker info >nul 2>&1
if not errorlevel 1 goto :docker_ready
set /a tries+=1
if !tries! geq 60 (
  echo [x] Docker did not start in time. Open Docker Desktop, wait until it says "running", then retry.
  goto :fail
)
goto :wait_docker

:docker_ready
echo [ok] Docker is running.

:: 3. Env file (optional)
if not exist "frontend\.env.local" (
  echo [i] No frontend\.env.local found - sample sessions will show and forms will not be saved.
  echo     Copy frontend\.env.example to frontend\.env.local and fill it in to connect the Google Sheet.
)

:: 4. Build and start
echo [..] Building and starting the container (first build takes a few minutes)...
docker compose up -d --build
if errorlevel 1 (
  echo [x] docker compose failed. See the output above.
  goto :fail
)

:: 5. Wait until the site answers, then open the browser
echo [..] Waiting for %URL% ...
set /a tries=0
:wait_site
ping -n 3 127.0.0.1 >nul
curl -s -o nul "%URL%" >nul 2>&1
if not errorlevel 1 goto :site_ready
set /a tries+=1
if !tries! geq 30 (
  echo [!] The site is not answering yet. Check logs with: docker compose logs -f
  goto :end
)
goto :wait_site

:site_ready
echo [ok] CodeXLab is live at %URL%
start "" "%URL%"
echo.
echo   Logs:  docker compose logs -f
echo   Stop:  stop.bat   (or: docker compose down)
goto :end

:fail
echo.
pause
exit /b 1

:end
echo.
pause
endlocal
