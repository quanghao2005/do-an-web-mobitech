@echo off
echo =======================================
echo KHOI DONG HE THONG MOBITECH
echo =======================================

echo 1. Dang khoi dong Backend (Java Spring Boot)...
cd /d "d:\DoAn\backend"
start "MobiTech - Backend API" cmd /c "mvn spring-boot:run"

timeout /t 5

echo 2. Dang khoi dong Frontend (React Vite)...
cd /d "d:\DoAn\frontend"
start "MobiTech - Frontend React" cmd /c "npm run dev"

echo =======================================
echo HE THONG DA DUOC KHOI DONG THANH CONG!
echo - Trang web: http://localhost:5173
echo - Ban co the thu nho cac cua so mau den lai, dung tat nhe!
echo =======================================
pause
