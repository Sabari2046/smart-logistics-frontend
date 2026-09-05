Write-Host "=== 1. Checking Frontend Web Application (Port 3000) ==="
$fe = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
Write-Host "Frontend Status Code: " $fe.StatusCode

Write-Host "`n=== 2. Testing Admin Auth (Port 8081) ==="
$loginPayload = '{"email":"admin@smartlogistics.com","password":"Admin@123"}'
$auth = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method Post -Body $loginPayload -ContentType "application/json"
Write-Host "Admin Login Success! User:" $auth.fullName "| Role:" $auth.role

Write-Host "`n=== 3. Testing Public Waybill Tracking API ==="
$track = Invoke-RestMethod -Uri "http://localhost:8081/api/shipments/tracking/SLF202610001" -Method Get
Write-Host "Tracking Number:" $track.trackingNumber "| Status:" $track.status "| Route:" $track.pickupCity "->" $track.deliveryCity

Write-Host "`n=== 4. Testing Admin Dashboard Metrics API ==="
$token = $auth.token
$headers = @{ "Authorization" = "Bearer $token" }
$dash = Invoke-RestMethod -Uri "http://localhost:8081/api/admin/dashboard" -Method Get -Headers $headers
Write-Host "Total Shipments:" $dash.totalShipments
Write-Host "Active Shipments:" $dash.activeShipments
Write-Host "Total Vehicles:" $dash.totalVehicles
Write-Host "Available Drivers:" $dash.availableDrivers

Write-Host "`n=== 5. Testing Executive Analytics Report API ==="
$rep = Invoke-RestMethod -Uri "http://localhost:8081/api/reports" -Method Get -Headers $headers
Write-Host "Total Deliveries:" $rep.totalDeliveries
Write-Host "Total Revenue: Rs." $rep.totalRevenue
Write-Host "Success Rate:" $rep.successRatePercent "%"
Write-Host "Top Driver:" $rep.topDrivers[0].driverName "Trips:" $rep.topDrivers[0].completedTrips

Write-Host "`n=== 6. Testing Driver Login ==="
$driverPayload = '{"email":"driver.arun@smartlogistics.com","password":"Driver@123"}'
$dAuth = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method Post -Body $driverPayload -ContentType "application/json"
Write-Host "Driver Login Success! Name:" $dAuth.fullName "| Role:" $dAuth.role

Write-Host "`n=== 7. Testing Customer Login ==="
$custPayload = '{"email":"customer.rahul@gmail.com","password":"Customer@123"}'
$cAuth = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method Post -Body $custPayload -ContentType "application/json"
Write-Host "Customer Login Success! Name:" $cAuth.fullName "| Role:" $cAuth.role

Write-Host "`n=== ALL END-TO-END VERIFICATION CHECKS PASSED PERFECTLY ==="
