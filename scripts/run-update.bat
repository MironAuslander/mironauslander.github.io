@echo off
echo.
echo ====================================
echo    Portfolio Update System
echo ====================================
echo.

echo Updating featured projects on homepage...
node scripts\update-featured.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to update featured projects
    pause
    exit /b 1
)

echo.
echo Updating projects page...
node scripts\update-projects-page.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to update projects page
    pause
    exit /b 1
)

echo.
echo Updating individual project pages...
node scripts\update-project-pages.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to update project pages
    pause
    exit /b 1
)

echo.
echo ====================================
echo    All updates completed!
echo ====================================
echo.
echo Your site has been updated with the latest project data.
echo.
pause