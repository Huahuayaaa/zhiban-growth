@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
if not exist "runtime\node.exe" (
  echo Runtime missing. Extract the whole ZIP before starting.
  pause
  exit /b 1
)
"runtime\node.exe" --disable-warning=ExperimentalWarning --import "./launcher/register.mjs" "./launcher/server.mjs"
if errorlevel 1 (
  echo.
  echo Startup failed. Please keep the error text above and send it to the sender.
)
pause
