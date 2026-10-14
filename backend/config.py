from __future__ import annotations

from dataclasses import dataclass
import os


def _as_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _as_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        return default


def _as_float(name: str, default: float) -> float:
    raw = os.getenv(name)
    if not raw:
        return default
    try:
        return float(raw)
    except ValueError:
        return default


def _as_list(name: str, default: list[str]) -> list[str]:
    raw = os.getenv(name)
    if not raw:
        return default
    items = [item.strip() for item in raw.split(",") if item.strip()]
    return items or default


@dataclass(frozen=True)
class Settings:
    openweather_api_key: str
    debug: bool
    host: str
    port: int
    request_timeout_seconds: float
    history_days: int
    history_batch_days: int
    cors_allowed_origins: list[str]
    rate_limit_per_minute: int
    max_city_length: int
    min_observed_days: int
    geocode_ttl_seconds: int
    history_ttl_seconds: int
    predict_ttl_seconds: int
    metro_ttl_seconds: int


def get_settings() -> Settings:
    return Settings(
        openweather_api_key=os.getenv("OPENWEATHER_API_KEY", "").strip(),
        debug=_as_bool(os.getenv("FLASK_DEBUG"), default=False),
        host=os.getenv("FLASK_HOST", "0.0.0.0"),
        port=_as_int("FLASK_PORT", 5000),
        request_timeout_seconds=_as_float("OPENWEATHER_TIMEOUT_SECONDS", 12.0),
        history_days=_as_int("AQI_HISTORY_DAYS", 365),
        history_batch_days=_as_int("AQI_HISTORY_BATCH_DAYS", 30),
        cors_allowed_origins=_as_list(
            "CORS_ALLOWED_ORIGINS",
            ["http://localhost:3000", "http://127.0.0.1:3000"],
        ),
        rate_limit_per_minute=_as_int("RATE_LIMIT_PER_MINUTE", 30),
        max_city_length=_as_int("MAX_CITY_LENGTH", 80),
        min_observed_days=_as_int("MIN_OBSERVED_DAYS", 30),
        geocode_ttl_seconds=_as_int("GEOCODE_CACHE_TTL_SECONDS", 60 * 60 * 6),
        history_ttl_seconds=_as_int("HISTORY_CACHE_TTL_SECONDS", 60 * 30),
        predict_ttl_seconds=_as_int("PREDICTION_CACHE_TTL_SECONDS", 60 * 15),
        metro_ttl_seconds=_as_int("METRO_CACHE_TTL_SECONDS", 60 * 5),
    )
