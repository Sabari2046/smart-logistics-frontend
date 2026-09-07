$login = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method Post -Body '{"email":"admintransbayx@gmail.com","password":"Admin@123"}' -ContentType "application/json"
Write-Host "Login Token Prefix:" $login.token.Substring(0, 20) "..."
Write-Host "Role:" $login.role "FullName:" $login.fullName

$token = $login.token
$headers = @{ "Authorization" = "Bearer $token" }

try {
  $dash = Invoke-RestMethod -Uri "http://localhost:8081/api/admin/dashboard" -Method Get -Headers $headers
  Write-Host "Admin Dashboard API: SUCCESS! Total Shipments:" $dash.totalShipments
} catch {
  Write-Host "Admin Dashboard API FAILED:" $_.Exception.Message
}

try {
  $users = Invoke-RestMethod -Uri "http://localhost:8081/api/admin/users" -Method Get -Headers $headers
  Write-Host "Admin Users API: SUCCESS! User count:" $users.Count
} catch {
  Write-Host "Admin Users API FAILED:" $_.Exception.Message
}

try {
  $delayed = Invoke-RestMethod -Uri "http://localhost:8081/api/admin/delayed-shipments" -Method Get -Headers $headers
  Write-Host "Admin Delayed API: SUCCESS! Count:" $delayed.Count
} catch {
  Write-Host "Admin Delayed API FAILED:" $_.Exception.Message
}

try {
  $shipments = Invoke-RestMethod -Uri "http://localhost:8081/api/shipments" -Method Get -Headers $headers
  Write-Host "Shipments API: SUCCESS! Count:" $shipments.Count
} catch {
  Write-Host "Shipments API FAILED:" $_.Exception.Message
}
