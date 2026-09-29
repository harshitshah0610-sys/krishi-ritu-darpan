SHELL := powershell.exe
.SHELLFLAGS := -Command

.PHONY: install train test backend frontend dev clean

install:
	@Write-Host "Installing backend dependencies..."
	cd backend; python -m pip install -r requirements.txt --prefer-binary
	@Write-Host "Installing frontend dependencies..."
	cd frontend; npm install

train:
	@Write-Host "Training LightGBM models (30-day quick mode)..."
	cd backend; python train_model.py --quick

train-full:
	@Write-Host "Training LightGBM models (365-day full mode)..."
	cd backend; python train_model.py

test:
	@Write-Host "Running unit tests..."
	cd backend; python -m pytest tests/ -v

backend:
	@Write-Host "Starting FastAPI backend on port 8000..."
	cd backend; python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

frontend:
	@Write-Host "Starting React frontend on port 5173..."
	cd frontend; npm run dev

build:
	@Write-Host "Building frontend for production..."
	cd frontend; npm run build

clean:
	@Remove-Item -Recurse -Force backend\cache\*.json -ErrorAction SilentlyContinue
	@Remove-Item -Recurse -Force frontend\dist -ErrorAction SilentlyContinue
	@Write-Host "Cleaned cache and dist."
