$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$email = "test_$timestamp@example.com"

$body = @{
    email = $email
    password = "TestPass123"
    metadata = @{
        full_name = "Test User"
    }
} | ConvertTo-Json

Write-Host "Testing signup endpoint..."
Write-Host "Email: $email"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri 'http://localhost:5000/auth/create-user' `
        -Method POST `
        -Headers @{'Content-Type'='application/json'} `
        -Body $body `
        -UseBasicParsing `
        -ErrorAction Stop

    Write-Host "✅ Success (Status: $($response.StatusCode))"
    Write-Host "Response:"
    Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "❌ Error"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    Write-Host "Status: $($_.Exception.Response.StatusDescription)"
    
    try {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $content = $reader.ReadToEnd()
        $reader.Close()
        
        Write-Host "Response Body:"
        Write-Host ($content | ConvertFrom-Json | ConvertTo-Json -Depth 5)
    } catch {
        Write-Host "Could not parse error response"
    }
}
