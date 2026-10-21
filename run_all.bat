@echo off
title PackSure - Master Launch Script
echo ========================================================
echo        PACKSURE - STARTING ALL SERVICES
echo ========================================================
echo.

:: 1. Start PostgreSQL (Port 5433)
echo [1/4] Starting PostgreSQL Database on port 5433...
start "PackSure - PostgreSQL Database (Port 5433)" cmd /k "D:\postgreSql\bin\postgres.exe -D d:\ProductCompliance\db"
timeout /t 3 /nobreak >nul

:: 2. Start Python FastAPI AI & Computer Vision Service (Port 8000)
echo [2/4] Starting Python FastAPI AI & Computer Vision Engine on port 8000...
start "PackSure - AI Computer Vision Service (Port 8000)" cmd /k "cd /d d:\ProductCompliance\product-compliance-scanner\ai-service && python main.py"
timeout /t 3 /nobreak >nul

:: 3. Start Spring Boot Backend API (Port 8081)
echo [3/4] Starting Spring Boot Backend API on port 8081...
start "PackSure - Spring Boot Backend (Port 8081)" cmd /k "cd /d d:\ProductCompliance\product-compliance-scanner\backend && C:\Users\santu_slim99\.m2\wrapper\dists\apache-maven-3.9.16-bin\5grr65jo27hi51sujmtcldfovl\apache-maven-3.9.16\bin\mvn.cmd spring-boot:run"
timeout /t 6 /nobreak >nul

:: 4. Start React Frontend (Port 5173)
echo [4/4] Starting Vite React Frontend on port 5173...
start "PackSure - React Frontend (Port 5173)" cmd /k "cd /d d:\ProductCompliance\product-compliance-scanner && npm run dev"

echo.
echo ========================================================
echo   ALL 4 PACKSURE SERVICES HAVE BEEN LAUNCHED!
echo ========================================================
echo   - Frontend:    http://localhost:5173
echo   - Backend API: http://localhost:8081
echo   - AI Service:  http://localhost:8000
echo   - Database:    localhost:5433 (packsure)
echo.
echo   Default Credentials:
echo   - Officer:  username 'officer' / password 'Officer@123'
echo   - Admin:    username 'admin'   / password 'Admin@123'
echo ========================================================
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:5173
pause
