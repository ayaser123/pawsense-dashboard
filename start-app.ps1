#!/usr/bin/env pwsh
# PawSense Dashboard - Start Both Backend and Frontend

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  PawSense Dashboard - Starting Frontend & Backend" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $scriptPath "server"
$frontendPath = $scriptPath

# Colors
$success = "Green"
$info = "Cyan"
$warning = "Yellow"

# Step 1: Start Backend
Write-Host "[1/2] Starting Backend Server..." -ForegroundColor $warning
Write-Host "      Location: $backendPath" -ForegroundColor $info
Write-Host "      Command: node server.js" -ForegroundColor $info

$backendJob = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $backendPath -PassThru -WindowStyle Minimized
Write-Host ("      Backend process started (PID: {0})" -f $backendJob.Id) -ForegroundColor $success
Write-Host ""

# Wait for backend to start
Write-Host "      Waiting for backend to initialize..." -ForegroundColor $info
Start-Sleep -Seconds 3

# Check backend health
$maxRetries = 5
$retryCount = 0
$backendReady = $false

while ($retryCount -lt $maxRetries) {
    try {
        $healthCheck = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET -ErrorAction SilentlyContinue
        if ($healthCheck.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host "      ✅ Backend is responsive!" -ForegroundColor $success
            break
        }
    } catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host ("      Attempt {0}/{1}..." -f $retryCount, $maxRetries) -ForegroundColor $info
            Start-Sleep -Seconds 2
        }
    }
}

if (-not $backendReady) {
    Write-Host "      Backend may still be starting (this is OK)" -ForegroundColor $warning
}

Write-Host ""

# Step 2: Start Frontend
Write-Host "[2/2] Starting Frontend Dev Server..." -ForegroundColor $warning
Write-Host "      Location: $frontendPath" -ForegroundColor $info
Write-Host "      Command: npm run dev" -ForegroundColor $info

$frontendJob = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory $frontendPath -PassThru -WindowStyle Normal
Write-Host ("      Frontend process started (PID: {0})" -f $frontendJob.Id) -ForegroundColor $success
Write-Host ""

# Summary
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Both servers are starting!" -ForegroundColor $success
Write-Host ""
Write-Host "Services:" -ForegroundColor $info
Write-Host "   - Backend API:  http://localhost:5000" -ForegroundColor Gray
Write-Host "   - Frontend:     http://localhost:8080" -ForegroundColor Gray
Write-Host ""
Write-Host "Key URLs:" -ForegroundColor $info
Write-Host "   - Homepage:     http://localhost:8080" -ForegroundColor Gray
Write-Host "   - Signup:       http://localhost:8080/signup" -ForegroundColor Gray
Write-Host "   - Login:        http://localhost:8080/login" -ForegroundColor Gray
Write-Host "   - Dashboard:    http://localhost:8080/dashboard" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop the servers:" -ForegroundColor $info
Write-Host "   - Close both command windows or use Task Manager" -ForegroundColor Gray
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
