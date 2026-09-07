Write-Host "=== 1. Checking Frontend Web Application (Port 3000) ==="
try {
  $fe = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
  Write-Host "Frontend Status Code: " $fe.StatusCode
} catch {
  Write-Host "Frontend check note: " $_.Exception.Message
}

Write-Host "`n=== 2. Testing Admin Auth (Port 8081) ==="
$loginPayload = '{"email":"admintransbayx@gmail.com","password":"Admin@123"}'
$auth = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method Post -Body $loginPayload -ContentType "application/json"
Write-Host "Admin Login Success! User:" $auth.fullName "| Role:" $auth.role

Write-Host "`n=== 3. Testing Admin Dashboard Metrics API ==="
$token = $auth.token
$headers = @{ "Authorization" = "Bearer $token" }
$dash = Invoke-RestMethod -Uri "http://localhost:8081/api/admin/dashboard" -Method Get -Headers $headers
Write-Host "Total Shipments:" $dash.totalShipments
Write-Host "Active Shipments:" $dash.activeShipments
Write-Host "Total Vehicles:" $dash.totalVehicles
Write-Host "Available Drivers:" $dash.availableDrivers

Write-Host "`n=== 4. Testing Admin Users API ==="
$users = Invoke-RestMethod -Uri "http://localhost:8081/api/admin/users" -Method Get -Headers $headers
Write-Host "Total Registered Users:" $users.Count

Write-Host "`n=== TransBayX VERIFICATION CHECKS COMPLETED ==="
