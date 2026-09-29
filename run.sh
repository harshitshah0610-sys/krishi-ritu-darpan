#!/bin/bash
# Krishi Ritu Darpan - Quick Start Script (Linux/macOS)

echo ""
echo "===================================================="
echo "  Krishi Ritu Darpan - Hyperlocal Weather for India"
echo "  Krishi Ritu Darpan (कृषि ऋतु दर्पण)"
echo "===================================================="
echo ""

if [ "$1" == "install" ]; then
    echo "[1/2] Installing Python dependencies..."
    cd backend
    python3 -m pip install -r requirements.txt --prefer-binary
    cd ..
    echo "[2/2] Installing Node.js dependencies..."
    cd frontend
    npm install
    cd ..
    echo "Done! Run: ./run.sh train"
    exit 0
fi

if [ "$1" == "train" ]; then
    echo "Training LightGBM models (30-day quick mode)..."
    cd backend
    python3 train_model.py --quick
    cd ..
    exit 0
fi

if [ "$1" == "test" ]; then
    echo "Running pytest unit tests..."
    cd backend
    python3 -m pytest tests/ -v
    cd ..
    exit 0
fi

if [ "$1" == "backend" ]; then
    echo "Starting FastAPI backend on http://localhost:8000 ..."
    cd backend
    python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    cd ..
    exit 0
fi

if [ "$1" == "frontend" ]; then
    echo "Starting React frontend on http://localhost:5173 ..."
    cd frontend
    npm run dev
    cd ..
    exit 0
fi

if [ "$1" == "dev" ]; then
    echo "Starting both backend and frontend..."
    cd backend && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    sleep 3
    cd frontend && npm run dev &
    FRONTEND_PID=$!
    
    echo ""
    echo "Backend: http://localhost:8000"
    echo "Frontend: http://localhost:5173"
    echo "API Docs: http://localhost:8000/docs"
    
    trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
    wait
    exit 0
fi

echo "Usage: ./run.sh [command]"
echo "Commands:"
echo "  install   - Install all dependencies"
echo "  train     - Train ML models (quick, 30 days)"
echo "  test      - Run unit tests"
echo "  backend   - Start FastAPI server on :8000"
echo "  frontend  - Start React dev server on :5173"
echo "  dev       - Start both backend and frontend"
