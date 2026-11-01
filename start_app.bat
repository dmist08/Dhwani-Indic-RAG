@echo off
title Launching Voice-Enabled Indic RAG System
echo ===============================================================
echo Starting Voice-Enabled Indic RAG (Full-Stack Launcher)
echo ===============================================================

echo [1/3] Launching FastAPI Backend on Port 8000...
start "Backend Server (FastAPI Port 8000)" cmd /k "cd /d %~dp0 && call activate rag-voice 2>nul || call conda activate rag-voice && python -m uvicorn backend.app:app --host 0.0.0.0 --port 8000 --reload --reload-dir backend"

echo [2/3] Launching Vite Frontend on Port 5173...
start "Frontend Server (Vite Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo Opening browser at http://localhost:5173...
start http://localhost:5173

echo ===============================================================
echo Both Backend (Port 8000) and Frontend (Port 5173) are running!
echo ===============================================================
pause
