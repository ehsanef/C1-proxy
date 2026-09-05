@echo off
setlocal
cd /d "%~dp0"
title ProxyFlow
where py >nul 2>nul
if not errorlevel 1 (
  py -3 -c "import sys; sys.exit(0 if sys.version_info >= (3,11) else 1)" >nul 2>nul
  if not errorlevel 1 (
    py -3 proxyflow.py
    goto done
  )
)
where python >nul 2>nul
if not errorlevel 1 (
  python -c "import sys; sys.exit(0 if sys.version_info >= (3,11) else 1)" >nul 2>nul
  if not errorlevel 1 (
    python proxyflow.py
    goto done
  )
)
echo ProxyFlow needs Python 3.11 or newer.
echo Install Python from python.org and run this launcher again.
echo The packaged ProxyFlow.exe does not require Python.
:done
echo.
echo ProxyFlow stopped. Review any error above.
pause
