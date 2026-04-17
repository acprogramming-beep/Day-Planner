@echo off
REM Day Planner - Start Local Server
REM This batch file starts the Python server to access the app from other devices

echo.
echo ================== Day Planner - Local Server ==================
echo.
echo Starting server...
echo.

cd /d "%~dp0"

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo.
    echo Please install Python from https://www.python.org/
    echo Make sure to check "Add Python to PATH" during installation
    echo.
    pause
    exit /b 1
)

REM Run the server
python server.py

pause
