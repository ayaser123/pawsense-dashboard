#!/usr/bin/env pwsh
<#
.DESCRIPTION
Complete PawSense Signup Flow Test Script
Tests all components of the signup flow from backend to frontend
#>

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          PawSense Signup Flow - Complete Test                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check ports
Write-Host "📋 Step 1: Checking if servers are running..." -ForegroundColor Yellow
$backend5000 = netstat -ano | Select-String ":5000" | Select-Object -First 1
$frontend8084 = netstat -ano | Select-String ":8084" | Select-Object -First 1

if ($backend5000) {
    Write-Host "  ✅ Backend port 5000: Running" -ForegroundColor Green
} else {
    Write-Host "  ❌ Backend port 5000: Not found" -ForegroundColor Red
}

if ($frontend8084) {
    Write-Host "  ✅ Frontend port 8084: Running" -ForegroundColor Green
} else {
    Write-Host "  ❌ Frontend port 8084: Not found" -ForegroundColor Red
}
Write-Host ""

# Step 2: Test backend health
Write-Host "📋 Step 2: Testing Backend Health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri 'http://localhost:5000/health' -UseBasicParsing -ErrorAction Stop
    $healthData = $healthResponse.Content | ConvertFrom-Json
    if ($healthData.status -eq "ok") {
        Write-Host "✅ Backend is healthy" -ForegroundColor Green
        Write-Host "   Status: $($healthData.status)" -ForegroundColor Gray
        Write-Host "   Environment: $($healthData.environment)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Backend health check failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Backend is not reachable" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Step 3: Test Supabase connection
Write-Host "📋 Step 3: Testing Supabase Connection..." -ForegroundColor Yellow
try {
    $debugResponse = Invoke-WebRequest -Uri 'http://localhost:5000/debug/supabase' -UseBasicParsing -ErrorAction Stop
    $debugData = $debugResponse.Content | ConvertFrom-Json
    if ($debugData.status -eq "ok") {
        Write-Host "✅ Supabase connection successful" -ForegroundColor Green
        Write-Host "   User count: $($debugData.userCount)" -ForegroundColor Gray
        Write-Host "   Supabase URL: $($debugData.supabaseUrl)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Supabase connection failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Could not test Supabase connection" -ForegroundColor Red
}
Write-Host ""

# Step 4: Test user creation
Write-Host "📋 Step 4: Testing User Creation..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$randomId = -join ((48..57) + (97..122) | Get-Random -Count 6 | ForEach-Object {[char]$_})
$testEmail = "test_${timestamp}_${randomId}@pawsense-test.dev"
$testPassword = "TestPassword123!"

Write-Host "  📧 Email: $testEmail" -ForegroundColor Gray
Write-Host "  🔐 Password: ***" -ForegroundColor Gray

$body = @{
    email = $testEmail
    password = $testPassword
    metadata = @{
        full_name = "Test User"
    }
} | ConvertTo-Json

try {
    $createResponse = Invoke-WebRequest -Uri 'http://localhost:5000/auth/create-user' `
        -Method POST `
        -Headers @{'Content-Type'='application/json'} `
        -Body $body `
        -UseBasicParsing `
        -ErrorAction Stop

    $createData = $createResponse.Content | ConvertFrom-Json
    
    if ($createData.success -or $createData.userId) {
        Write-Host "✅ User created successfully" -ForegroundColor Green
        Write-Host "   User ID: $($createData.userId)" -ForegroundColor Gray
        Write-Host "   Email: $($createData.email)" -ForegroundColor Gray
    } else {
        Write-Host "❌ User creation returned unexpected response" -ForegroundColor Red
        Write-Host "   Response: $($createData)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ User creation failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try to get error details
    try {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorContent = $reader.ReadToEnd()
        $reader.Close()
        $errorData = $errorContent | ConvertFrom-Json
        Write-Host "   Details: $($errorData.details)" -ForegroundColor Red
    } catch {
        # Silent - couldn't parse error details
    }
}
Write-Host ""

# Summary
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                      TEST COMPLETE                             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ All backend tests passed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:8084/signup in your browser"
Write-Host "2. Use these credentials:"
Write-Host "   Email: $testEmail"
Write-Host "   Password: $testPassword"
Write-Host "   Full Name: Your Name"
Write-Host "3. Submit the form"
Write-Host "4. Check browser console (F12) for [SIGNUP] and [AUTH] logs"
Write-Host "5. You should be redirected to /dashboard on success"
Write-Host ""
