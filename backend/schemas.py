from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from werkzeug.exceptions import BadRequest


@dataclass
class ValidationError(Exception):
    message: str
    status_code: int = 400
    code: str = "validation_error"


def parse_predict_payload(payload: Any, max_city_length: int) -> str:
    if payload is None:
        raise ValidationError("Request body must be valid JSON.", 400, "invalid_json")
    if not isinstance(payload, dict):
        raise ValidationError("JSON body must be an object.", 400, "invalid_json_type")

    city = payload.get("city")
    if city is None:
        raise ValidationError("City name is required.", 400, "missing_city")
    if not isinstance(city, str):
        raise ValidationError("City must be a string.", 400, "invalid_city_type")

    normalized_city = city.strip()
    if not normalized_city:
        raise ValidationError("City name is required.", 400, "empty_city")
    if len(normalized_city) > max_city_length:
        raise ValidationError(f"City must be at most {max_city_length} characters.", 400, "city_too_long")
    return normalized_city


def safe_get_json(request_obj: Any) -> Any:
    try:
        return request_obj.get_json(silent=False)
    except BadRequest as exc:
        raise ValidationError("Request body must be valid JSON.", 400, "invalid_json") from exc
