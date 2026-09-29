@echo off
REM Krishi Ritu Darpan - Quick Start Script (Windows)

echo.
echo ====================================================
echo   Krishi Ritu Darpan - Hyperlocal Weather for India
echo   Krishi Ritu Darpan (कृषि ऋतु दर्पण)
echo ====================================================
echo.

IF "%1"=="install" GOTO install
IF "%1"=="train" GOTO train
IF "%1"=="test" GOTO test
IF "%1"=="backend" GOTO backend
IF "%1"=="frontend" GOTO frontend
IF "%1"=="dev" GOTO dev

echo Usage: run.bat [command]
echo Commands:
echo   install   - Install all dependencies
echo   train     - Train ML models (quick, 30 days)
echo   test      - Run unit tests
echo   backend   - Start FastAPI server on :8000
echo   frontend  - Start React dev server on :5173
echo   dev       - Start both backend and frontend
GOTO end

:install
echo [1/2] Installing Python dependencies...
cd backend
python -m pip install -r requirements.txt --prefer-binary
cd ..
echo [2/2] Installing Node.js dependencies...
cd frontend
npm install
cd ..
echo Done! Run: run.bat train
GOTO end

:train
echo Training LightGBM models (30-day quick mode)...
cd backend
python train_model.py --quick
cd ..
GOTO end

:test
echo Running pytest unit tests...
cd backend
python -m pytest tests/ -v
cd ..
GOTO end

:backend
echo Starting FastAPI backend on http://localhost:8000 ...
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
cd ..
GOTO end

:frontend
echo Starting React frontend on http://localhost:5173 ...
cd frontend
npm run dev
cd ..
GOTO end

:dev
echo Starting both backend and frontend...
start "Krishi Ritu Darpan Backend" cmd /k "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3 /nobreak >nul
start "Krishi Ritu Darpan Frontend" cmd /k "cd frontend && npm run dev"
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
GOTO end

:end
