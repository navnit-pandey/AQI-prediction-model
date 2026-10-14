# AirQ Predict

Production-hardened AQI dashboard with a **Next.js frontend (`frontend/`)** and a **Flask API backend (`app.py`, `backend/`)**.

## Architecture

- `frontend/`: canonical UI (Next.js App Router + TypeScript)
- `backend/`: Flask API modules (config, routes, OpenWeather client, AQI domain logic, forecasting, validation/cache)
- Flask now runs as **API-only** (`/api/*`, `/healthz`)

## API Endpoints

- `POST /api/predict`
- `GET /api/metro-cities`
- `GET /healthz`

## Environment Variables

Copy `.env.example` to `.env` and set values.

Required:
- `OPENWEATHER_API_KEY`

Important optional settings:
- `CORS_ALLOWED_ORIGINS` (comma-separated)
- `RATE_LIMIT_PER_MINUTE`
- `OPENWEATHER_TIMEOUT_SECONDS`
- `PREDICTION_CACHE_TTL_SECONDS`, `METRO_CACHE_TTL_SECONDS`, `HISTORY_CACHE_TTL_SECONDS`
- `FLASK_HOST`, `FLASK_PORT`, `FLASK_DEBUG`
- `NEXT_PUBLIC_BACKEND_URL`

## Local Development

### Backend

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend runs on `http://localhost:5000` by default.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Production Commands

Backend (example):
```bash
gunicorn app:app --bind 0.0.0.0:5000
```

Frontend:
```bash
cd frontend
npm run build
npm run start
```

## API Response Contract (Predict)

`POST /api/predict` body:

```json
{ "city": "Delhi" }
```

Response fields include:
- `status`: `ok | partial | unavailable`
- `history` and `full_history` (each point may include `estimated: true` when interpolated)
- `predictions` (5-day forecast)
- `model_metrics` (`validation_method` uses chronological holdout, includes baseline MAE)
- `data_quality` (observed/interpolated/coverage and notes)

If observed data is insufficient, API returns a safe `503` error with no provider secrets.

## Reliability and Security Hardening

- HTTPS upstream calls to OpenWeather with request timeouts
- Input validation for JSON payloads and city constraints
- Structured error handling/logging (no broad silent exceptions)
- Configurable CORS allowlist (safe local defaults)
- Lightweight in-memory rate limiting
- In-memory TTL caching for geocoding, historical fetches, metro snapshots, and prediction responses

## Testing and Verification

### Frontend
```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

### Backend
```bash
python -m compileall backend app.py
python -m unittest discover -s tests -p 'test_*.py'
```

## CI

GitHub Actions workflow (`.github/workflows/ci.yml`) runs:
- Frontend install + lint + typecheck + build
- Backend install + compile + tests
- `pip-audit` dependency vulnerability scan

## Operational Notes

- Logs are emitted to stdout/stderr via Python logging for platform collection.
- `GET /healthz` is provided for health checks.
- Caches and rate limiting are in-memory (single-process scope); for horizontal scaling, replace with shared cache/rate-limit infrastructure.

## Guidance Disclaimer

Health suggestions in the UI are general informational guidance and not a substitute for professional medical advice.
