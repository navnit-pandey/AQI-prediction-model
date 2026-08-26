# pyrefly: ignore [missing-import]
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests as http_requests
# pyrefly: ignore [missing-import]
import numpy as np
from datetime import datetime, timedelta
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, ExtraTreesRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, r2_score
import os


def calculate_sub_aqi(cp, breakpoints):
    """
    cp: concentration of pollutant
    breakpoints: list of tuples ((cp_low, cp_high), (aqi_low, aqi_high))
    """
    for (cp_low, cp_high), (aqi_low, aqi_high) in breakpoints:
        if cp_low <= cp <= cp_high:
            aqi = ((aqi_high - aqi_low) / (cp_high - cp_low)) * (cp - cp_low) + aqi_low
            return round(aqi)
    # If it is higher than the max breakpoint:
    if breakpoints and cp > breakpoints[-1][0][1]:
        cp_low, cp_high = breakpoints[-1][0]
        aqi_low, aqi_high = breakpoints[-1][1]
        aqi = ((aqi_high - aqi_low) / (cp_high - cp_low)) * (cp - cp_low) + aqi_low
        return min(500, round(aqi))
    return 0


def get_us_aqi(pm2_5, pm10, co_ug, no2_ug, so2_ug, o3_ug):
    # Truncations and conversions (at standard 25 C and 1 atm)
    c_pm25 = np.floor(pm2_5 * 10) / 10.0
    c_pm10 = np.floor(pm10)
    
    # 1 ppm CO = 1145 ug/m3
    c_co = np.floor((co_ug / 1145.0) * 10) / 10.0
    
    # 1 ppm O3 = 1960 ug/m3
    c_o3 = np.floor((o3_ug / 1960.0) * 1000) / 1000.0
    
    # 1 ppb NO2 = 1.88 ug/m3
    c_no2 = np.floor(no2_ug / 1.88)
    
    # 1 ppb SO2 = 2.62 ug/m3
    c_so2 = np.floor(so2_ug / 2.62)
    
    # Breakpoints lists
    pm25_bp = [
        ((0.0, 9.0), (0, 50)),
        ((9.1, 35.4), (51, 100)),
        ((35.5, 55.4), (101, 150)),
        ((55.5, 125.4), (151, 200)),
        ((125.5, 225.4), (201, 300)),
        ((225.5, 325.4), (301, 400)),
        ((325.5, 500.4), (401, 500))
    ]
    
    pm10_bp = [
        ((0, 54), (0, 50)),
        ((55, 154), (51, 100)),
        ((155, 254), (101, 150)),
        ((255, 354), (151, 200)),
        ((355, 424), (201, 300)),
        ((425, 504), (301, 400)),
        ((505, 604), (401, 500))
    ]
    
    co_bp = [
        ((0.0, 4.4), (0, 50)),
        ((4.5, 9.4), (51, 100)),
        ((9.5, 12.4), (101, 150)),
        ((12.5, 15.4), (151, 200)),
        ((15.5, 30.4), (201, 300)),
        ((30.5, 40.4), (301, 400)),
        ((40.5, 50.4), (401, 500))
    ]
    
    o3_bp = [
        ((0.000, 0.054), (0, 50)),
        ((0.055, 0.070), (51, 100)),
        ((0.071, 0.085), (101, 150)),
        ((0.086, 0.105), (151, 200)),
        ((0.106, 0.200), (201, 300)),
        ((0.201, 0.604), (301, 500))
    ]
    
    no2_bp = [
        ((0, 53), (0, 50)),
        ((54, 100), (51, 100)),
        ((101, 360), (101, 150)),
        ((361, 649), (151, 200)),
        ((650, 1249), (201, 300)),
        ((1250, 1649), (301, 400)),
        ((1650, 2049), (401, 500))
    ]
    
    so2_bp = [
        ((0, 35), (0, 50)),
        ((36, 75), (51, 100)),
        ((76, 185), (101, 150)),
        ((186, 304), (151, 200)),
        ((305, 604), (201, 300)),
        ((605, 804), (301, 400)),
        ((805, 1004), (401, 500))
    ]
    
    aqi_pm25 = calculate_sub_aqi(c_pm25, pm25_bp)
    aqi_pm10 = calculate_sub_aqi(c_pm10, pm10_bp)
    aqi_co = calculate_sub_aqi(c_co, co_bp)
    aqi_o3 = calculate_sub_aqi(c_o3, o3_bp)
    aqi_no2 = calculate_sub_aqi(c_no2, no2_bp)
    aqi_so2 = calculate_sub_aqi(c_so2, so2_bp)
    
    return max(aqi_pm25, aqi_pm10, aqi_co, aqi_o3, aqi_no2, aqi_so2)

app = Flask(__name__, static_folder="static", static_url_path="")
CORS(app)

# Load environment variables from .env if present
env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

API_KEY = os.environ.get("OPENWEATHER_API_KEY", "")


def get_aqi_category(aqi):
    """Return AQI category string based on value."""
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 150:
        return "Unhealthy (Sensitive)"
    elif aqi <= 200:
        return "Unhealthy"
    elif aqi <= 300:
        return "Very Unhealthy"
    else:
        return "Hazardous"


def interpolate_series(series):
    """Linearly interpolate None values in a list."""
    n = len(series)
    res = list(series)
    
    # Find the first non-None value to fill leading Nones
    first_val = None
    for val in res:
        if val is not None:
            first_val = val
            break
    if first_val is None:
        return [0.0] * n # All are None
        
    for i in range(n):
        if res[i] is None:
            res[i] = first_val
        else:
            break
            
    # Find the last non-None value to fill trailing Nones
    last_val = None
    for val in reversed(res):
        if val is not None:
            last_val = val
            break
    for i in range(n - 1, -1, -1):
        if res[i] is None:
            res[i] = last_val
        else:
            break
            
    # Interpolate middle Nones
    i = 0
    while i < n:
        if res[i] is None:
            start_idx = i - 1
            while i < n and res[i] is None:
                i += 1
            end_idx = i
            
            if end_idx >= n:
                for j in range(start_idx + 1, n):
                    res[j] = last_val
                break
                
            start_val = res[start_idx]
            end_val = res[end_idx]
            
            block_len = end_idx - start_idx
            for j in range(start_idx + 1, end_idx):
                weight = (j - start_idx) / block_len
                res[j] = start_val + weight * (end_val - start_val)
        else:
            i += 1
            
    return res


@app.route("/")
def serve_index():
    return send_from_directory("static", "index.html")


@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json()
    city = data.get("city", "").strip()

    if not city:
        return jsonify({"error": "City name is required."}), 400

    if not API_KEY:
        return jsonify({"error": "OpenWeatherMap API key is not configured. Please set the OPENWEATHER_API_KEY environment variable in your backend settings."}), 500

    # Step 1: Geocode the city
    try:
        geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={API_KEY}"
        geo_response = http_requests.get(geo_url, timeout=10)
        geo_response.raise_for_status()
        geo_data = geo_response.json()

        if not geo_data:
            return jsonify({"error": f"City '{city}' not found. Please try again."}), 404

        lat = geo_data[0]["lat"]
        lon = geo_data[0]["lon"]
        city_name = geo_data[0].get("name", city)
        country = geo_data[0].get("country", "")
    except Exception as e:
        return jsonify({"error": f"Failed to geocode city: {str(e)}"}), 500

    # Step 2: Fetch historical AQI data (365 days / 1 year) in 30-day batches
    HISTORY_DAYS = 365
    BATCH_DAYS = 30

    daily_components = {}  # date_str -> list of components dicts

    now = datetime.now()
    start_date = now - timedelta(days=HISTORY_DAYS)

    # Fetch in 30-day windows to minimize API calls (~12 calls instead of 365)
    current_start = start_date
    while current_start < now:
        current_end = min(current_start + timedelta(days=BATCH_DAYS), now)
        start_ts = int(current_start.timestamp())
        end_ts = int(current_end.timestamp())

        try:
            url = (
                f"http://api.openweathermap.org/data/2.5/air_pollution/history"
                f"?lat={lat}&lon={lon}&start={start_ts}&end={end_ts}&appid={API_KEY}"
            )
            response = http_requests.get(url, timeout=30)
            resp_data = response.json()

            if "list" in resp_data:
                for item in resp_data["list"]:
                    item_dt = datetime.fromtimestamp(item["dt"])
                    day_key = item_dt.strftime("%Y-%m-%d")
                    if "components" in item:
                        if day_key not in daily_components:
                            daily_components[day_key] = []
                        daily_components[day_key].append(item["components"])
        except Exception:
            pass

        current_start = current_end

    # Build sorted daily averages and compute US AQI
    raw_aqis = []
    dates = []

    for day_offset in range(HISTORY_DAYS, -1, -1):
        day = now - timedelta(days=day_offset)
        day_key = day.strftime("%Y-%m-%d")
        dates.append(day_key)

        if day_key in daily_components and daily_components[day_key]:
            comps = daily_components[day_key]
            avg_pm2_5 = np.mean([c.get("pm2_5", 0) for c in comps])
            avg_pm10 = np.mean([c.get("pm10", 0) for c in comps])
            avg_co = np.mean([c.get("co", 0) for c in comps])
            avg_no2 = np.mean([c.get("no2", 0) for c in comps])
            avg_so2 = np.mean([c.get("so2", 0) for c in comps])
            avg_o3 = np.mean([c.get("o3", 0) for c in comps])

            day_aqi = get_us_aqi(avg_pm2_5, avg_pm10, avg_co, avg_no2, avg_so2, avg_o3)
            raw_aqis.append(day_aqi)
        else:
            raw_aqis.append(None)

    # Linearly interpolate missing days to make the series perfectly continuous
    aqi_history = interpolate_series(raw_aqis)

    # Step 3: Prepare training data with larger window
    window_size = 14
    X_train = []
    y_train = []

    for i in range(len(aqi_history) - window_size):
        X_train.append(aqi_history[i : i + window_size])
        y_train.append(aqi_history[i + window_size])

    X_train = np.array(X_train)
    y_train = np.array(y_train)

    if len(X_train) < 10:
        return jsonify({"error": "Not enough training samples. Need at least 30 days of data."}), 500

    X_tr, X_te, y_tr, y_te = train_test_split(
        X_train, y_train, test_size=0.2, random_state=42
    )

    # Step 4: Train ensemble of models
    models = {
        "RandomForest": RandomForestRegressor(n_estimators=150, random_state=42, max_depth=10),
        "GradientBoosting": GradientBoostingRegressor(n_estimators=100, random_state=42, max_depth=5, learning_rate=0.05),
        "ExtraTrees": ExtraTreesRegressor(n_estimators=150, random_state=42, max_depth=10),
        "Ridge": Ridge(alpha=1.0)
    }

    trained_models = {}
    model_maes = {}
    model_r2s = {}

    for name, model in models.items():
        try:
            model.fit(X_tr, y_tr)
            preds = model.predict(X_te)
            mae_val = mean_absolute_error(y_te, preds)
            r2_val = r2_score(y_te, preds)
            trained_models[name] = model
            model_maes[name] = max(0.001, float(mae_val))
            model_r2s[name] = float(r2_val)
        except Exception:
            pass

    if not trained_models:
        return jsonify({"error": "Failed to train any regression models."}), 500

    # Calculate dynamic ensemble weights using reciprocal MAE (lower MAE -> higher weight)
    inv_maes = {name: 1.0 / mae for name, mae in model_maes.items()}
    sum_inv_mae = sum(inv_maes.values())
    weights = {name: val / sum_inv_mae for name, val in inv_maes.items()}

    # Compute combined predictions on test set to calculate ensemble metrics
    y_pred_test = np.zeros_like(y_te, dtype=float)
    for name, model in trained_models.items():
        y_pred_test += weights[name] * model.predict(X_te)

    mae = float(mean_absolute_error(y_te, y_pred_test))
    r2 = float(r2_score(y_te, y_pred_test))

    # Step 5: Predict next 5 days using the weighted ensemble
    future_predictions = []
    current_window = list(aqi_history[-window_size:])

    # Get the last date in our continuous history
    last_date_str = dates[-1]
    last_date = datetime.strptime(last_date_str, "%Y-%m-%d")

    for day_num in range(1, 6):
        pred = 0.0
        for name, model in trained_models.items():
            pred += weights[name] * float(model.predict([current_window])[0])
        pred = max(0, pred)  # AQI can't be negative
        
        future_date = (last_date + timedelta(days=day_num)).strftime("%Y-%m-%d")

        future_predictions.append(
            {
                "day": day_num,
                "date": future_date,
                "aqi": round(pred, 2),
                "category": get_aqi_category(pred),
            }
        )

        current_window.pop(0)
        current_window.append(pred)

    # Build full history (all 365 days for chart & download)
    full_history = []
    for d, a in zip(dates, aqi_history):
        full_history.append(
            {"date": d, "aqi": round(a, 2), "category": get_aqi_category(a)}
        )

    # Build display history (last 11 days only for dashboard widgets)
    DISPLAY_DAYS = 11
    history = full_history[-DISPLAY_DAYS:]

    return jsonify(
        {
            "city": city_name,
            "country": country,
            "lat": round(lat, 4),
            "lon": round(lon, 4),
            "history": history,
            "full_history": full_history,
            "predictions": future_predictions,
            "model_metrics": {"r2": round(r2, 4), "mae": round(mae, 4)},
        }
    )


# ===== INDIA METRO CITIES ENDPOINT =====

METRO_CITIES = [
    {"name": "Ahmedabad", "lat": 23.0225, "lon": 72.5714},
    {"name": "Bangalore", "lat": 12.9716, "lon": 77.5946},
    {"name": "Chennai", "lat": 13.0827, "lon": 80.2707},
    {"name": "Hyderabad", "lat": 17.3850, "lon": 78.4867},
    {"name": "Kolkata", "lat": 22.5726, "lon": 88.3639},
    {"name": "Mumbai", "lat": 19.0760, "lon": 72.8777},
    {"name": "New Delhi", "lat": 28.6139, "lon": 77.2090},
    {"name": "Pune", "lat": 18.5204, "lon": 73.8567},
]


@app.route("/api/metro-cities")
def metro_cities():
    """Fetch current AQI, temperature, and humidity for Indian metro cities."""
    results = []

    for city in METRO_CITIES:
        city_data = {
            "name": city["name"],
            "lat": city["lat"],
            "lon": city["lon"],
            "aqi": None,
            "category": None,
            "temp": None,
            "humidity": None,
        }

        try:
            # Fetch current air pollution
            aqi_url = (
                f"http://api.openweathermap.org/data/2.5/air_pollution"
                f"?lat={city['lat']}&lon={city['lon']}&appid={API_KEY}"
            )
            aqi_resp = http_requests.get(aqi_url, timeout=10)
            aqi_data = aqi_resp.json()

            if "list" in aqi_data and aqi_data["list"]:
                comp = aqi_data["list"][0].get("components", {})
                scaled_aqi = get_us_aqi(
                    pm2_5=comp.get("pm2_5", 0),
                    pm10=comp.get("pm10", 0),
                    co_ug=comp.get("co", 0),
                    no2_ug=comp.get("no2", 0),
                    so2_ug=comp.get("so2", 0),
                    o3_ug=comp.get("o3", 0)
                )
                city_data["aqi"] = scaled_aqi
                city_data["category"] = get_aqi_category(scaled_aqi)
        except Exception:
            pass

        try:
            # Fetch current weather (temp + humidity)
            weather_url = (
                f"http://api.openweathermap.org/data/2.5/weather"
                f"?lat={city['lat']}&lon={city['lon']}&appid={API_KEY}&units=metric"
            )
            weather_resp = http_requests.get(weather_url, timeout=10)
            weather_data = weather_resp.json()

            if "main" in weather_data:
                city_data["temp"] = round(weather_data["main"]["temp"])
                city_data["humidity"] = weather_data["main"]["humidity"]
        except Exception:
            pass

        results.append(city_data)

    return jsonify({"cities": results})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
