# API Validation Test Script
# Tests all API endpoints and validates error handling

$baseUrl = "http://localhost:8080"
$token = $null
$testResults = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [object]$Body,
        [int]$ExpectedStatus,
        [string]$Token
    )
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        $params = @{
            Uri = "$baseUrl$Url"
            Method = $Method
            Headers = $headers
            UseBasicParsing = $true
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        
        $result = @{
            Name = $Name
            Status = "PASS"
            StatusCode = $response.StatusCode
            Expected = $ExpectedStatus
            Message = "Success"
        }
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "✅ PASS: $Name" -ForegroundColor Green
        } else {
            $result.Status = "FAIL"
            $result.Message = "Expected $ExpectedStatus but got $($response.StatusCode)"
            Write-Host "❌ FAIL: $Name - $($result.Message)" -ForegroundColor Red
        }
        
        return $result, $response
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $result = @{
            Name = $Name
            Status = if ($statusCode -eq $ExpectedStatus) { "PASS" } else { "FAIL" }
            StatusCode = $statusCode
            Expected = $ExpectedStatus
            Message = $_.Exception.Message
        }
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "✅ PASS: $Name (Expected error: $statusCode)" -ForegroundColor Green
        } else {
            Write-Host "❌ FAIL: $Name - Expected $ExpectedStatus but got $statusCode" -ForegroundColor Red
        }
        
        return $result, $null
    }
}

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     API VALIDATION TESTING - Premium Insurance App         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Test 1: Authentication Tests
Write-Host "━━━ AUTHENTICATION TESTS ━━━" -ForegroundColor Yellow

# Valid login
$result, $response = Test-Endpoint `
    -Name "Valid Login (admin)" `
    -Method POST `
    -Url "/api/v1/auth/login" `
    -Body @{ username = "admin"; password = "Admin@1234" } `
    -ExpectedStatus 200

if ($response) {
    $loginData = $response.Content | ConvertFrom-Json
    $token = $loginData.token
    Write-Host "   Token obtained: $($token.Substring(0, 20))..." -ForegroundColor Gray
}
$testResults += $result

# Invalid credentials
$result, $_ = Test-Endpoint `
    -Name "Invalid Login (wrong password)" `
    -Method POST `
    -Url "/api/v1/auth/login" `
    -Body @{ username = "admin"; password = "wrongpassword" } `
    -ExpectedStatus 401
$testResults += $result

# Missing username
$result, $_ = Test-Endpoint `
    -Name "Login with missing username" `
    -Method POST `
    -Url "/api/v1/auth/login" `
    -Body @{ password = "Admin@1234" } `
    -ExpectedStatus 400
$testResults += $result

# Registration validation - weak password
$result, $_ = Test-Endpoint `
    -Name "Register with weak password" `
    -Method POST `
    -Url "/api/v1/auth/register" `
    -Body @{ username = "testuser"; email = "test@test.com"; password = "weak" } `
    -ExpectedStatus 400
$testResults += $result

# Registration validation - invalid email
$result, $_ = Test-Endpoint `
    -Name "Register with invalid email" `
    -Method POST `
    -Url "/api/v1/auth/register" `
    -Body @{ username = "testuser"; email = "notanemail"; password = "Strong@1234" } `
    -ExpectedStatus 400
$testResults += $result

Write-Host "`n━━━ AUTHORIZATION TESTS ━━━" -ForegroundColor Yellow

# Access without token
$result, $_ = Test-Endpoint `
    -Name "Access policies without token" `
    -Method GET `
    -Url "/api/policies" `
    -ExpectedStatus 401
$testResults += $result

# Access with valid token
$result, $_ = Test-Endpoint `
    -Name "Access policies with valid token" `
    -Method GET `
    -Url "/api/policies" `
    -Token $token `
    -ExpectedStatus 200
$testResults += $result

Write-Host "`n━━━ POLICY VALIDATION TESTS ━━━" -ForegroundColor Yellow

# Create policy with missing required fields
$result, $_ = Test-Endpoint `
    -Name "Create policy without policy name" `
    -Method POST `
    -Url "/api/policies" `
    -Body @{ policyType = "MOTOR"; premiumAmount = 5000 } `
    -Token $token `
    -ExpectedStatus 400
$testResults += $result

# Create policy with negative premium
$result, $_ = Test-Endpoint `
    -Name "Create policy with negative premium" `
    -Method POST `
    -Url "/api/policies" `
    -Body @{ 
        policyName = "Test Policy"
        policyType = "MOTOR"
        premiumAmount = -5000
        duration = 12
        policyStatus = "ACTIVE"
        customerId = 1
    } `
    -Token $token `
    -ExpectedStatus 400
$testResults += $result

# Create policy with zero duration
$result, $_ = Test-Endpoint `
    -Name "Create policy with zero duration" `
    -Method POST `
    -Url "/api/policies" `
    -Body @{ 
        policyName = "Test Policy"
        policyType = "MOTOR"
        premiumAmount = 5000
        duration = 0
        policyStatus = "ACTIVE"
        customerId = 1
    } `
    -Token $token `
    -ExpectedStatus 400
$testResults += $result

Write-Host "`n━━━ CLAIM VALIDATION TESTS ━━━" -ForegroundColor Yellow

# Create claim with missing required fields
$result, $_ = Test-Endpoint `
    -Name "Create claim without description" `
    -Method POST `
    -Url "/api/claims" `
    -Body @{ claimAmount = 10000; policyId = 1 } `
    -Token $token `
    -ExpectedStatus 400
$testResults += $result

# Create claim with negative amount
$result, $_ = Test-Endpoint `
    -Name "Create claim with negative amount" `
    -Method POST `
    -Url "/api/claims" `
    -Body @{ 
        claimAmount = -10000
        description = "Test claim"
        policyId = 1
        customerId = 1
    } `
    -Token $token `
    -ExpectedStatus 400
$testResults += $result

Write-Host "`n━━━ PAYMENT VALIDATION TESTS ━━━" -ForegroundColor Yellow

# Create payment with missing required fields
$result, $_ = Test-Endpoint `
    -Name "Create payment without amount" `
    -Method POST `
    -Url "/api/payments" `
    -Body @{ paymentMethod = "CREDIT_CARD"; policyId = 1 } `
    -Token $token `
    -ExpectedStatus 400
$testResults += $result

# Create payment with negative amount
$result, $_ = Test-Endpoint `
    -Name "Create payment with negative amount" `
    -Method POST `
    -Url "/api/payments" `
    -Body @{ 
        amount = -5000
        paymentMethod = "CREDIT_CARD"
        paymentStatus = "SUCCESS"
        paymentDate = "2026-09-15"
        policyId = 1
        customerId = 1
    } `
    -Token $token `
    -ExpectedStatus 400
$testResults += $result

Write-Host "`n━━━ CUSTOMER VALIDATION TESTS ━━━" -ForegroundColor Yellow

# Create customer with invalid email
$result, $_ = Test-Endpoint `
    -Name "Create customer with invalid email" `
    -Method POST `
    -Url "/api/customers" `
    -Body @{ 
        name = "Test Customer"
        email = "notanemail"
        phone = "1234567890"
        address = "Test Address"
    } `
    -Token $token `
    -ExpectedStatus 400
$testResults += $result

# Create customer with missing name
$result, $_ = Test-Endpoint `
    -Name "Create customer without name" `
    -Method POST `
    -Url "/api/customers" `
    -Body @{ 
        email = "test@test.com"
        phone = "1234567890"
        address = "Test Address"
    } `
    -Token $token `
    -ExpectedStatus 400
$testResults += $result

Write-Host "`n━━━ ENDORSEMENT VALIDATION TESTS ━━━" -ForegroundColor Yellow

# Create endorsement without description
$result, $_ = Test-Endpoint `
    -Name "Create endorsement without description" `
    -Method POST `
    -Url "/api/endorsements" `
    -Body @{ 
        policyId = 1
        endorsementType = "COVERAGE_INCREASE"
        effectiveDate = "2026-10-01"
    } `
    -Token $token `
    -ExpectedStatus 400
$testResults += $result

# Summary
Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    TEST SUMMARY                             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$passCount = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$totalCount = $testResults.Count

Write-Host "Total Tests: $totalCount" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })
Write-Host "Success Rate: $([math]::Round(($passCount / $totalCount) * 100, 2))%" -ForegroundColor Cyan

if ($failCount -gt 0) {
    Write-Host "`nFailed Tests:" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  ❌ $($_.Name) - Expected $($_.Expected), Got $($_.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`n✨ Testing Complete!`n" -ForegroundColor Green
