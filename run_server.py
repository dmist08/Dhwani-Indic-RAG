import sys
from pathlib import Path
import uvicorn

BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / "backend"
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

if __name__ == "__main__":
    print("Starting FastAPI Backend Server on port 8000 (Auto-Reload Enabled)...")
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=True, reload_dirs=[str(BACKEND_DIR)], app_dir=str(BASE_DIR))
