@echo off
setlocal
cd /d "%~dp0"
title Build ProxyFlow
py -3 -c "import sys; sys.exit(0 if sys.version_info >= (3,11) else 1)"
if errorlevel 1 goto failed
py -3 -m venv .build-env
if errorlevel 1 goto failed
.build-env\Scripts\python.exe -m pip install pyinstaller==6.22.2
if errorlevel 1 goto failed
.build-env\Scripts\python.exe -m unittest discover -s tests -v
if errorlevel 1 goto failed
.build-env\Scripts\python.exe -m PyInstaller --clean --noconfirm --onefile --console --name ProxyFlow --add-data "web;web" proxyflow.py
if errorlevel 1 goto failed
.build-env\Scripts\python.exe tests\smoke_executable.py dist\ProxyFlow.exe
if errorlevel 1 goto failed
echo.
echo Built dist\ProxyFlow.exe. This executable is unsigned.
echo It uses system cURL 8.4 or newer. Do not disable OS protection.
pause
exit /b 0
:failed
echo.
echo Build failed. Review the error above.
pause
exit /b 1
