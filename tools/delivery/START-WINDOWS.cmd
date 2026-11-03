@echo off
cd /d "%~dp0"
where py >nul 2>&1
if not errorlevel 1 (
  py -3 "%~dp0serve_windows.py"
  goto done
)
where python >nul 2>&1
if not errorlevel 1 (
  python "%~dp0serve_windows.py"
  goto done
)
echo Python 3 is required. Read WINDOWS-README.md.
:done
pause
