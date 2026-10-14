from __future__ import annotations

from datetime import datetime
import logging
from typing import Any

import requests


class ProviderError(Exception):
    pass


class OpenWeatherClient:
    def __init__(self, api_key: str, timeout_seconds: float = 12.0) -> None:
        self._api_key = api_key
        self._timeout = timeout_seconds
        self._session = requests.Session()
        self._logger = logging.getLogger(__name__)

    def _get(self, url: str, params: dict[str, Any]) -> Any:
        request_params = {**params, "appid": self._api_key}
        try:
            response = self._session.get(url, params=request_params, timeout=self._timeout)
            response.raise_for_status()
            return response.json()
        except requests.Timeout as exc:
            self._logger.warning("OpenWeather request timeout for %s", url)
            raise ProviderError("Upstream weather provider timed out.") from exc
        except requests.RequestException as exc:
            self._logger.warning("OpenWeather request failed for %s", url)
            raise ProviderError("Upstream weather provider request failed.") from exc

    def geocode_city(self, city: str) -> dict[str, Any]:
        data = self._get(
            "https://api.openweathermap.org/geo/1.0/direct",
            {"q": city, "limit": 1},
        )
        if not isinstance(data, list) or not data:
            raise ProviderError("City not found.")
        first = data[0]
        return {
            "lat": float(first["lat"]),
            "lon": float(first["lon"]),
            "name": first.get("name", city),
            "country": first.get("country", ""),
        }

    def fetch_air_pollution_history(self, lat: float, lon: float, start: datetime, end: datetime) -> list[dict[str, Any]]:
        payload = self._get(
            "https://api.openweathermap.org/data/2.5/air_pollution/history",
            {"lat": lat, "lon": lon, "start": int(start.timestamp()), "end": int(end.timestamp())},
        )
        records = payload.get("list", []) if isinstance(payload, dict) else []
        return records if isinstance(records, list) else []

    def fetch_current_air_pollution(self, lat: float, lon: float) -> dict[str, Any]:
        payload = self._get(
            "https://api.openweathermap.org/data/2.5/air_pollution",
            {"lat": lat, "lon": lon},
        )
        return payload if isinstance(payload, dict) else {}

    def fetch_current_weather(self, lat: float, lon: float) -> dict[str, Any]:
        payload = self._get(
            "https://api.openweathermap.org/data/2.5/weather",
            {"lat": lat, "lon": lon, "units": "metric"},
        )
        return payload if isinstance(payload, dict) else {}
