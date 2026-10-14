from __future__ import annotations

from flask import Blueprint, jsonify, request

from .schemas import parse_predict_payload, safe_get_json
from .services import AqiService


def create_api_blueprint(service: AqiService, max_city_length: int) -> Blueprint:
    api = Blueprint("api", __name__, url_prefix="/api")

    @api.route("/predict", methods=["POST"])
    def predict() -> tuple[object, int]:
        payload = safe_get_json(request)
        city = parse_predict_payload(payload, max_city_length=max_city_length)
        result = service.predict(city)
        return jsonify(result), 200

    @api.route("/metro-cities", methods=["GET"])
    def metro_cities() -> tuple[object, int]:
        result = service.metro_cities()
        return jsonify(result), 200

    return api
