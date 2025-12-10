# PawSense - Start Backend and Frontend

Write-Host "🐾 PawSense - Starting Backend and Frontend" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Start Backend in new window
Write-Host "`n[1/2] Starting Backend Server..." -ForegroundColor Yellow
# Ensure backend dependencies are installed
if (-not (Test-Path "$PSScriptRoot\server\node_modules")) {
	Write-Host "Installing backend dependencies..." -ForegroundColor Gray
	Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; npm install; npm run dev" -WindowStyle Normal
} else {
	Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; npm run dev" -WindowStyle Normal
}

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Start Frontend in new window
Write-Host "[2/2] Starting Frontend Development Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev" -WindowStyle Normal

Write-Host "`n✅ Both servers starting in separate windows!" -ForegroundColor Green
Write-Host "`n📋 What to do next:" -ForegroundColor Cyan
Write-Host "  1. Wait 10-15 seconds for both servers to fully start" -ForegroundColor Gray
Write-Host "  2. Frontend will open at http://localhost:8080" -ForegroundColor Gray
Write-Host "  3. Backend runs on http://localhost:5000" -ForegroundColor Gray
Write-Host "  4. Check browser console for errors" -ForegroundColor Gray
Write-Host "`n🔗 Test URLs:" -ForegroundColor Cyan
Write-Host "  - http://localhost:8080 (Homepage)" -ForegroundColor Gray
Write-Host "  - http://localhost:8080/signup (Signup page)" -ForegroundColor Gray
Write-Host "  - http://localhost:8080/login (Login page)" -ForegroundColor Gray
Write-Host "  - http://localhost:5000/health (Backend health check)" -ForegroundColor Gray
Write-Host "  - http://localhost:5000/debug/supabase (Supabase connection)" -ForegroundColor Gray
