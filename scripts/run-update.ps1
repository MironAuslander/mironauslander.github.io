# Portfolio Update System - PowerShell Script
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "    Portfolio Update System" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to the project root directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Push-Location $projectRoot

try {
    # Update featured projects
    Write-Host "Updating featured projects on homepage..." -ForegroundColor Yellow
    $result1 = node scripts/update-featured.js 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host $result1 -ForegroundColor Green
    } else {
        Write-Host "ERROR: Failed to update featured projects" -ForegroundColor Red
        Write-Host $result1
        exit 1
    }

    Write-Host ""

    # Update projects page
    Write-Host "Updating projects page..." -ForegroundColor Yellow
    $result2 = node scripts/update-projects-page.js 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host $result2 -ForegroundColor Green
    } else {
        Write-Host "ERROR: Failed to update projects page" -ForegroundColor Red
        Write-Host $result2
        exit 1
    }

    Write-Host ""

    # Update individual project pages
    Write-Host "Updating individual project pages..." -ForegroundColor Yellow
    $result3 = node scripts/update-project-pages.js 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host $result3 -ForegroundColor Green
    } else {
        Write-Host "ERROR: Failed to update project pages" -ForegroundColor Red
        Write-Host $result3
        exit 1
    }

    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "    All updates completed!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Your site has been updated with the latest project data." -ForegroundColor Green
    Write-Host ""
}
finally {
    Pop-Location
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")