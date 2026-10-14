from __future__ import annotations

import logging

from flask import Flask, jsonify, request
from flask_cors import CORS

from .config import get_settings
from .openweather import OpenWeatherClient, ProviderError
from .rate_limit import RateLimiter
from .routes import create_api_blueprint
from .schemas import ValidationError
from .services import AqiService, ServiceError


def create_app() -> Flask:
    settings = get_settings()

    logging.basicConfig(
        level=logging.DEBUG if settings.debug else logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )

    app = Flask(__name__)
    CORS(
        app,
        resources={r"/api/*": {"origins": settings.cors_allowed_origins}},
    )

    weather_client = OpenWeatherClient(
        api_key=settings.openweather_api_key,
        timeout_seconds=settings.request_timeout_seconds,
    )
    service = AqiService(settings=settings, weather_client=weather_client)
    limiter = RateLimiter(max_requests=settings.rate_limit_per_minute)

    app.register_blueprint(create_api_blueprint(service, settings.max_city_length))

    @app.before_request
    def enforce_rate_limit() -> tuple[object, int] | None:
        if not request.path.startswith("/api/"):
            return None
        identifier = request.headers.get("X-Forwarded-For", request.remote_addr or "unknown")
        if not limiter.allow(identifier):
            return jsonify({"error": "Rate limit exceeded. Please retry shortly."}), 429
        return None

    @app.route("/healthz", methods=["GET"])
    def healthz() -> tuple[object, int]:
        return (
            jsonify(
                {
                    "status": "ok",
                    "service": "aqi-backend",
                    "version": "1",
                }
            ),
            200,
        )

    @app.errorhandler(ValidationError)
    def handle_validation_error(error: ValidationError) -> tuple[object, int]:
        return jsonify({"error": error.message, "code": error.code}), error.status_code

    @app.errorhandler(ServiceError)
    def handle_service_error(error: ServiceError) -> tuple[object, int]:
        return jsonify({"error": error.message, "code": error.code}), error.status_code

    @app.errorhandler(ProviderError)
    def handle_provider_error(_: ProviderError) -> tuple[object, int]:
        return jsonify({"error": "Upstream weather provider is unavailable.", "code": "provider_unavailable"}), 503

    @app.errorhandler(Exception)
    def handle_unexpected_error(error: Exception) -> tuple[object, int]:
        app.logger.exception("Unhandled exception: %s", error)
        return jsonify({"error": "Internal server error.", "code": "internal_error"}), 500

    return app
