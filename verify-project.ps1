# Premium Enterprise Insurance App - Verification Script
# This script verifies that the project is complete and ready to run

Write-Host "`n🔍 Premium Enterprise Insurance App - Project Verification" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# Function to check if command exists
function Test-Command {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Function to check file exists
function Test-ProjectFile {
    param($path, $description)
    if (Test-Path $path) {
        Write-Host "✅ $description" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $description - NOT FOUND" -ForegroundColor Red
        $script:errors++
        return $false
    }
}

# Check Prerequisites
Write-Host "`n📋 Checking Prerequisites..." -ForegroundColor Yellow
Write-Host "-" * 70

if (Test-Command "java") {
    $javaVersion = java -version 2>&1 | Select-String "version" | ForEach-Object { $_.ToString() }
    Write-Host "✅ Java installed: $javaVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Java not found (required: Java 17+)" -ForegroundColor Red
    $errors++
}

if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found (required: Node 18+)" -ForegroundColor Red
    $errors++
}

if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Host "✅ npm installed: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm not found" -ForegroundColor Red
    $errors++
}

if (Test-Command "psql") {
    Write-Host "✅ PostgreSQL client installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  PostgreSQL client not found (optional for local dev)" -ForegroundColor Yellow
    $warnings++
}

if (Test-Command "docker") {
    Write-Host "✅ Docker installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Docker not found (optional, needed for docker compose)" -ForegroundColor Yellow
    $warnings++
}

# Check Project Structure
Write-Host "`n📁 Checking Project Structure..." -ForegroundColor Yellow
Write-Host "-" * 70

Test-ProjectFile "src\backend\pom.xml" "Backend Maven configuration" | Out-Null
Test-ProjectFile "src\backend\src\main\java\com\insurance\InsuranceApplication.java" "Backend main application" | Out-Null
Test-ProjectFile "src\backend\src\main\resources\application.properties" "Backend application properties" | Out-Null
Test-ProjectFile "src\backend\src\main\resources\application-dev.properties" "Backend dev properties" | Out-Null
Test-ProjectFile "src\backend\src\main\resources\application-prod.properties" "Backend prod properties" | Out-Null
Test-ProjectFile "src\backend\src\main\resources\db\migration\V1__initial_schema.sql" "Database migration V1" | Out-Null
Test-ProjectFile "src\backend\src\main\resources\db\migration\V2__endorsements.sql" "Database migration V2" | Out-Null

Test-ProjectFile "package.json" "Frontend package configuration" | Out-Null
Test-ProjectFile "vite.config.ts" "Vite configuration" | Out-Null
Test-ProjectFile "src\frontend\main.tsx" "Frontend entry point" | Out-Null
Test-ProjectFile "src\frontend\app\App.tsx" "Frontend main app" | Out-Null
Test-ProjectFile "src\frontend\services\api.ts" "Frontend API service" | Out-Null
Test-ProjectFile "src\frontend\index.html" "Frontend HTML" | Out-Null

# Check Documentation
Write-Host "`n📚 Checking Documentation..." -ForegroundColor Yellow
Write-Host "-" * 70

Test-ProjectFile "README.md" "Main README" | Out-Null
Test-ProjectFile "QUICK_START.md" "Quick start guide" | Out-Null
Test-ProjectFile "PROJECT_COMPLETION_REPORT.md" "Completion report" | Out-Null
Test-ProjectFile "DEPLOYMENT_CHECKLIST.md" "Deployment checklist" | Out-Null
Test-ProjectFile "docs\API.md" "API documentation" | Out-Null
Test-ProjectFile "docs\DATABASE.md" "Database documentation" | Out-Null
Test-ProjectFile "docs\TESTING.md" "Testing documentation" | Out-Null
Test-ProjectFile ".env.example" "Environment template" | Out-Null

# Check Docker Configuration
Write-Host "`n🐳 Checking Docker Configuration..." -ForegroundColor Yellow
Write-Host "-" * 70

Test-ProjectFile "docker-compose.yml" "Docker Compose configuration" | Out-Null
Test-ProjectFile "src\backend\Dockerfile" "Backend Dockerfile" | Out-Null
Test-ProjectFile "Dockerfile.frontend" "Frontend Dockerfile" | Out-Null
Test-ProjectFile "nginx.conf" "Nginx configuration" | Out-Null

# Check Controllers (sample)
Write-Host "`n🎮 Checking Backend Controllers..." -ForegroundColor Yellow
Write-Host "-" * 70

Test-ProjectFile "src\backend\src\main\java\com\insurance\controller\AuthController.java" "Auth controller" | Out-Null
Test-ProjectFile "src\backend\src\main\java\com\insurance\controller\PolicyController.java" "Policy controller" | Out-Null
Test-ProjectFile "src\backend\src\main\java\com\insurance\controller\ClaimController.java" "Claim controller" | Out-Null
Test-ProjectFile "src\backend\src\main\java\com\insurance\controller\PaymentController.java" "Payment controller" | Out-Null
Test-ProjectFile "src\backend\src\main\java\com\insurance\controller\EndorsementController.java" "Endorsement controller" | Out-Null
Test-ProjectFile "src\backend\src\main\java\com\insurance\controller\CustomerController.java" "Customer controller" | Out-Null
Test-ProjectFile "src\backend\src\main\java\com\insurance\controller\AnalyticsController.java" "Analytics controller" | Out-Null

# Check Services (sample)
Write-Host "`n⚙️  Checking Backend Services..." -ForegroundColor Yellow
Write-Host "-" * 70

Test-ProjectFile "src\backend\src\main\java\com\insurance\service\PolicyService.java" "Policy service" | Out-Null
Test-ProjectFile "src\backend\src\main\java\com\insurance\service\ClaimService.java" "Claim service" | Out-Null
Test-ProjectFile "src\backend\src\main\java\com\insurance\service\EndorsementService.java" "Endorsement service" | Out-Null
Test-ProjectFile "src\backend\src\main\java\com\insurance\service\AuditService.java" "Audit service" | Out-Null

# Check Security
Write-Host "`n🔐 Checking Security Components..." -ForegroundColor Yellow
Write-Host "-" * 70

Test-ProjectFile "src\backend\src\main\java\com\insurance\config\SecurityConfig.java" "Security configuration" | Out-Null
Test-ProjectFile "src\backend\src\main\java\com\insurance\security\JwtService.java" "JWT service" | Out-Null
Test-ProjectFile "src\backend\src\main\java\com\insurance\security\JwtAuthenticationFilter.java" "JWT filter" | Out-Null

# Check Environment Variables
Write-Host "`n🔧 Checking Environment Configuration..." -ForegroundColor Yellow
Write-Host "-" * 70

$requiredEnvVars = @("DB_URL", "DB_USERNAME", "DB_PASSWORD", "JWT_SECRET")
$missingVars = @()

foreach ($var in $requiredEnvVars) {
    if ([Environment]::GetEnvironmentVariable($var)) {
        Write-Host "✅ $var is set" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $var not set (required for running)" -ForegroundColor Yellow
        $missingVars += $var
        $warnings++
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "`nℹ️  Set these variables before running:" -ForegroundColor Cyan
    Write-Host '  $env:DB_URL = "jdbc:postgresql://localhost:5432/insurance_db"' -ForegroundColor Gray
    Write-Host '  $env:DB_USERNAME = "postgres"' -ForegroundColor Gray
    Write-Host '  $env:DB_PASSWORD = "your_password"' -ForegroundColor Gray
    Write-Host '  $env:JWT_SECRET = "your-secret-key-min-32-chars"' -ForegroundColor Gray
}

# Try to compile backend
Write-Host "`n🔨 Attempting Backend Compilation..." -ForegroundColor Yellow
Write-Host "-" * 70

if (Test-Path "src\backend\pom.xml") {
    Write-Host "Compiling backend... (this may take a moment)" -ForegroundColor Cyan
    Push-Location "src\backend"
    try {
        $compileOutput = & .\mvnw.cmd clean compile -DskipTests -q 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Backend compiles successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Backend compilation failed" -ForegroundColor Red
            Write-Host $compileOutput -ForegroundColor Red
            $errors++
        }
    } catch {
        Write-Host "❌ Error during compilation: $_" -ForegroundColor Red
        $errors++
    }
    Pop-Location
} else {
    Write-Host "❌ pom.xml not found, skipping compilation" -ForegroundColor Red
}

# Check if node_modules exists
Write-Host "`n📦 Checking Frontend Dependencies..." -ForegroundColor Yellow
Write-Host "-" * 70

if (Test-Path "node_modules") {
    Write-Host "✅ node_modules directory exists" -ForegroundColor Green
    
    # Try to build frontend
    Write-Host "Attempting frontend build... (this may take a moment)" -ForegroundColor Cyan
    try {
        $buildOutput = npm run build 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Frontend builds successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Frontend build failed" -ForegroundColor Red
            $errors++
        }
    } catch {
        Write-Host "❌ Error during build: $_" -ForegroundColor Red
        $errors++
    }
} else {
    Write-Host "⚠️  node_modules not found - run 'npm install --package-lock=false' first" -ForegroundColor Yellow
    $warnings++
}

# Summary
Write-Host "`n" + "=" * 70 -ForegroundColor Cyan
Write-Host "📊 VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "`n🎉 SUCCESS! Project is complete and ready to run!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "  1. Set environment variables (if not set)" -ForegroundColor White
    Write-Host "  2. Start PostgreSQL database" -ForegroundColor White
    Write-Host "  3. Run backend: cd src\backend; .\mvnw.cmd spring-boot:run" -ForegroundColor White
    Write-Host "  4. Run frontend: npm run dev" -ForegroundColor White
    Write-Host "  5. Open browser: http://localhost:5173" -ForegroundColor White
    Write-Host "`nOr use Docker:" -ForegroundColor Cyan
    Write-Host "  docker compose up --build" -ForegroundColor White
} elseif ($errors -eq 0) {
    Write-Host "`n✅ Project structure is complete!" -ForegroundColor Green
    Write-Host "⚠️  $warnings warning(s) - see details above" -ForegroundColor Yellow
    Write-Host "`nProject is functional but some optional components are missing." -ForegroundColor Yellow
} else {
    Write-Host "`n❌ $errors error(s) found!" -ForegroundColor Red
    if ($warnings -gt 0) {
        Write-Host "⚠️  $warnings warning(s) - see details above" -ForegroundColor Yellow
    }
    Write-Host "`nPlease fix the errors above before running." -ForegroundColor Red
}

Write-Host "`n📖 Documentation:" -ForegroundColor Cyan
Write-Host "  - QUICK_START.md - 5-minute setup guide" -ForegroundColor White
Write-Host "  - README.md - Complete documentation" -ForegroundColor White
Write-Host "  - PROJECT_COMPLETION_REPORT.md - Feature list" -ForegroundColor White
Write-Host "  - DEPLOYMENT_CHECKLIST.md - Production deployment guide" -ForegroundColor White

Write-Host "`n" + "=" * 70 -ForegroundColor Cyan
Write-Host ""

# Exit with appropriate code
if ($errors -gt 0) {
    exit 1
} else {
    exit 0
}
