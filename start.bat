@echo off
echo ========================================
echo   Euphoria Paintings - Setup & Run
echo ========================================
echo.

cd /d "%~dp0"

echo Installing dependencies...
call npm install

echo.
echo ========================================
echo   Starting development server...
echo ========================================
echo.

call npm run dev

pause
