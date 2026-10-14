from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta
import logging
from typing import Any

import numpy as np

from .aqi import get_aqi_category, get_us_aqi, interpolate_series_with_flags
from .cache import TTLCache
from .config import Settings
from .model import ForecastingError, train_and_forecast
from .openweather import OpenWeatherClient, ProviderError


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


class ServiceError(Exception):
    def __init__(self, message: str, status_code: int = 500, code: str = "service_error") -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.code = code


class AqiService:
    def __init__(self, settings: Settings, weather_client: OpenWeatherClient) -> None:
        self.settings = settings
        self.weather_client = weather_client
        self.logger = logging.getLogger(__name__)
        self._geocode_cache: TTLCache[dict[str, Any]] = TTLCache()
        self._history_cache: TTLCache[dict[str, list[dict[str, Any]]]] = TTLCache()
        self._prediction_cache: TTLCache[dict[str, Any]] = TTLCache()
        self._metro_cache: TTLCache[dict[str, Any]] = TTLCache()

    def _get_geocode(self, city: str) -> dict[str, Any]:
        cache_key = city.lower()
        cached = self._geocode_cache.get(cache_key)
        if cached:
            return cached

        try:
            geocode = self.weather_client.geocode_city(city)
        except ProviderError as exc:
            if "City not found" in str(exc):
                raise ServiceError(f"City '{city}' not found. Please try another city.", 404, "city_not_found") from exc
            raise ServiceError("Unable to geocode city at the moment.", 503, "geocode_unavailable") from exc

        self._geocode_cache.set(cache_key, geocode, self.settings.geocode_ttl_seconds)
        return geocode

    def _fetch_daily_components(self, lat: float, lon: float) -> tuple[dict[str, list[dict[str, Any]]], int]:
        cache_key = f"{lat:.4f}:{lon:.4f}:{self.settings.history_days}:{self.settings.history_batch_days}"
        cached = self._history_cache.get(cache_key)
        if cached:
            return cached.get("daily_components", {}), int(cached.get("failed_batches", 0))

        now = datetime.utcnow()
        start_date = now - timedelta(days=self.settings.history_days)
        current_start = start_date
        failed_batches = 0
        max_batches = max(1, int(np.ceil(self.settings.history_days / max(1, self.settings.history_batch_days))) + 2)

        daily_components: dict[str, list[dict[str, Any]]] = {}
        batch_count = 0

        while current_start < now and batch_count < max_batches:
            batch_count += 1
            current_end = min(current_start + timedelta(days=self.settings.history_batch_days), now)
            try:
                records = self.weather_client.fetch_air_pollution_history(lat, lon, current_start, current_end)
                for item in records:
                    timestamp = item.get("dt")
                    components = item.get("components")
                    if not timestamp or not isinstance(components, dict):
                        continue
                    day_key = datetime.utcfromtimestamp(int(timestamp)).strftime("%Y-%m-%d")
                    daily_components.setdefault(day_key, []).append(components)
            except ProviderError:
                failed_batches += 1
                self.logger.warning(
                    "Failed to fetch history batch for %.4f, %.4f (%s to %s)",
                    lat,
                    lon,
                    current_start.isoformat(),
                    current_end.isoformat(),
                )
            current_start = current_end

        self._history_cache.set(
            cache_key,
            {"daily_components": daily_components, "failed_batches": failed_batches},
            self.settings.history_ttl_seconds,
        )
        return daily_components, failed_batches

    def predict(self, city: str) -> dict[str, Any]:
        cache_key = city.lower()
        cached_response = self._prediction_cache.get(cache_key)
        if cached_response:
            return cached_response

        if not self.settings.openweather_api_key:
            raise ServiceError("Weather provider API key is not configured.", 503, "provider_config_error")

        geocode = self._get_geocode(city)
        lat, lon = geocode["lat"], geocode["lon"]

        daily_components, failed_batches = self._fetch_daily_components(lat, lon)

        now = datetime.utcnow()
        dates: list[str] = []
        observed_series: list[float | None] = []

        for day_offset in range(self.settings.history_days, -1, -1):
            day = now - timedelta(days=day_offset)
            day_key = day.strftime("%Y-%m-%d")
            dates.append(day_key)
            components = daily_components.get(day_key, [])

            if not components:
                observed_series.append(None)
                continue

            try:
                avg_pm2_5 = float(np.mean([c.get("pm2_5", 0) for c in components]))
                avg_pm10 = float(np.mean([c.get("pm10", 0) for c in components]))
                avg_co = float(np.mean([c.get("co", 0) for c in components]))
                avg_no2 = float(np.mean([c.get("no2", 0) for c in components]))
                avg_so2 = float(np.mean([c.get("so2", 0) for c in components]))
                avg_o3 = float(np.mean([c.get("o3", 0) for c in components]))
            except Exception as exc:
                self.logger.warning("Invalid component payload for %s: %s", day_key, exc)
                observed_series.append(None)
                continue

            observed_series.append(
                get_us_aqi(
                    pm2_5=avg_pm2_5,
                    pm10=avg_pm10,
                    co_ug=avg_co,
                    no2_ug=avg_no2,
                    so2_ug=avg_so2,
                    o3_ug=avg_o3,
                )
            )

        interpolated_series, estimated_flags, observed_days, interpolated_days = interpolate_series_with_flags(observed_series)

        if observed_days < self.settings.min_observed_days:
            raise ServiceError(
                "Insufficient observed air-quality data for a reliable forecast. Please try again later.",
                503,
                "insufficient_observed_data",
            )

        if any(value is None for value in interpolated_series):
            raise ServiceError("AQI history is unavailable for this city right now.", 503, "history_unavailable")

        history_values = [float(value) for value in interpolated_series if value is not None]

        try:
            forecast = train_and_forecast(history_values)
        except ForecastingError as exc:
            raise ServiceError(str(exc), 503, "forecast_unavailable") from exc

        full_history = [
            {
                "date": date,
                "aqi": round(aqi, 1),
                "category": get_aqi_category(aqi),
                "estimated": bool(estimated_flags[idx]),
            }
            for idx, (date, aqi) in enumerate(zip(dates, history_values))
        ]

        latest_date = datetime.strptime(dates[-1], "%Y-%m-%d")
        predictions = []
        for idx, value in enumerate(forecast.predictions, start=1):
            pred_date = (latest_date + timedelta(days=idx)).strftime("%Y-%m-%d")
            predictions.append(
                {
                    "day": idx,
                    "date": pred_date,
                    "aqi": round(value, 1),
                    "category": get_aqi_category(value),
                }
            )

        total_days = len(observed_series)
        coverage_ratio = round(observed_days / total_days, 4) if total_days else 0.0
        status = "ok"
        notes: list[str] = []

        if interpolated_days > 0:
            status = "partial"
            notes.append("Some missing daily observations were estimated using interpolation.")
        if failed_batches > 0:
            status = "partial"
            notes.append("Some upstream history windows were unavailable during fetch.")

        response = {
            "status": status,
            "city": geocode["name"],
            "country": geocode["country"],
            "lat": round(lat, 4),
            "lon": round(lon, 4),
            "history": full_history[-11:],
            "full_history": full_history,
            "predictions": predictions,
            "model_metrics": forecast.model_metrics,
            "data_quality": {
                "observed_days": observed_days,
                "interpolated_days": interpolated_days,
                "total_days": total_days,
                "coverage_ratio": coverage_ratio,
                "notes": notes,
            },
        }

        self._prediction_cache.set(cache_key, response, self.settings.predict_ttl_seconds)
        return response

    def _build_metro_city(self, city: dict[str, Any]) -> dict[str, Any]:
        city_data = {
            "name": city["name"],
            "lat": city["lat"],
            "lon": city["lon"],
            "aqi": None,
            "category": None,
            "temp": None,
            "humidity": None,
            "data_status": "unavailable",
        }

        has_air_data = False
        has_weather_data = False

        try:
            air_data = self.weather_client.fetch_current_air_pollution(city["lat"], city["lon"])
            records = air_data.get("list", [])
            if isinstance(records, list) and records:
                components = records[0].get("components", {})
                scaled_aqi = get_us_aqi(
                    pm2_5=components.get("pm2_5", 0),
                    pm10=components.get("pm10", 0),
                    co_ug=components.get("co", 0),
                    no2_ug=components.get("no2", 0),
                    so2_ug=components.get("so2", 0),
                    o3_ug=components.get("o3", 0),
                )
                city_data["aqi"] = int(round(scaled_aqi))
                city_data["category"] = get_aqi_category(scaled_aqi)
                has_air_data = True
        except ProviderError:
            self.logger.warning("Metro air data unavailable for %s", city["name"])

        try:
            weather_data = self.weather_client.fetch_current_weather(city["lat"], city["lon"])
            main = weather_data.get("main", {})
            if isinstance(main, dict) and "temp" in main and "humidity" in main:
                city_data["temp"] = round(float(main["temp"]))
                city_data["humidity"] = int(main["humidity"])
                has_weather_data = True
        except ProviderError:
            self.logger.warning("Metro weather data unavailable for %s", city["name"])

        if has_air_data and has_weather_data:
            city_data["data_status"] = "ok"
        elif has_air_data or has_weather_data:
            city_data["data_status"] = "partial"

        return city_data

    def metro_cities(self) -> dict[str, Any]:
        cached = self._metro_cache.get("metro")
        if cached:
            return cached

        results: list[dict[str, Any]] = []
        with ThreadPoolExecutor(max_workers=4) as executor:
            futures = [executor.submit(self._build_metro_city, city) for city in METRO_CITIES]
            for future in as_completed(futures):
                results.append(future.result())

        results.sort(key=lambda item: item["name"])
        payload = {
            "status": "ok",
            "cities": results,
            "updated_at": datetime.utcnow().isoformat() + "Z",
        }
        self._metro_cache.set("metro", payload, self.settings.metro_ttl_seconds)
        return payload
