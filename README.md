# AQI Prediction Model

AQI Prediction Model is a full-stack air quality forecasting app.
It uses a Flask backend and a Next.js frontend to fetch historical pollution data, train an ensemble regression model, and predict AQI for the next 5 days.

## Tech Stack
- **Backend:** Python, Flask, NumPy, scikit-learn
- **Frontend:** Next.js, React, TypeScript
- **Data Source:** OpenWeatherMap APIs

## Project Structure
- `/app.py` - Flask API server and AQI prediction logic
- `/frontend` - Next.js web app
- `/static` - Static web assets served by Flask
- `start-app.bat` - Starts backend and frontend together (Windows)

## Prerequisites
- Python 3.9+
- Node.js 18+
- npm

## Setup

### 1) Backend setup
From the repository root:

```bash
python -m venv .venv
# Windows
.venv\\Scripts\\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### 2) Frontend setup
From the repository root:

```bash
cd frontend
npm install
```

## Running the app

### Option A: Run both (Windows helper script)
From the repository root:

```bash
start-app.bat
```

### Option B: Run manually
Backend (root directory):

```bash
python app.py
```

Frontend (`frontend` directory):

```bash
npm run dev
```

Then open: `http://localhost:3000`

## API Endpoints
- `POST /api/predict` - Predict AQI history + 5-day forecast for a city
- `GET /api/metro-cities` - Current AQI/weather summary for selected Indian metro cities

## Lint and Build
Frontend commands (from `/frontend`):

```bash
npm run lint
npm run build
```

## Notes
- The backend currently contains a hardcoded OpenWeatherMap API key in `app.py`.
- No automated backend test suite is configured in this repository.
