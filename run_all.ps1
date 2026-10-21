Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       PACKSURE - STARTING ALL SERVICES (PowerShell)    " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. PostgreSQL (Port 5433)
Write-Host "`n[1/4] Starting PostgreSQL Database on port 5433..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& 'D:\postgreSql\bin\postgres.exe' -D 'd:\ProductCompliance\db'"
Start-Sleep -Seconds 3

# 2. FastAPI AI Service (Port 8000)
Write-Host "[2/4] Starting Python FastAPI AI & Computer Vision Engine on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\ProductCompliance\product-compliance-scanner\ai-service'; python main.py"
Start-Sleep -Seconds 3

# 3. Spring Boot Backend (Port 8081)
Write-Host "[3/4] Starting Spring Boot Backend API on port 8081..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\ProductCompliance\product-compliance-scanner\backend'; & 'C:\Users\santu_slim99\.m2\wrapper\dists\apache-maven-3.9.16-bin\5grr65jo27hi51sujmtcldfovl\apache-maven-3.9.16\bin\mvn.cmd' spring-boot:run"
Start-Sleep -Seconds 6

# 4. Vite React Frontend (Port 5173)
Write-Host "[4/4] Starting Vite React Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\ProductCompliance\product-compliance-scanner'; npm run dev"

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "  ALL 4 PACKSURE SERVICES HAVE BEEN LAUNCHED!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  - Frontend:    http://localhost:5173" -ForegroundColor White
Write-Host "  - Backend API: http://localhost:8081" -ForegroundColor White
Write-Host "  - AI Service:  http://localhost:8000" -ForegroundColor White
Write-Host "  - Database:    localhost:5433 (packsure)`n" -ForegroundColor White

Write-Host "  Default Credentials:" -ForegroundColor Cyan
Write-Host "  - Officer:  username 'officer' / password 'Officer@123'"
Write-Host "  - Admin:    username 'admin'   / password 'Admin@123'"
Write-Host "========================================================`n" -ForegroundColor Green

Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"
