from __future__ import annotations

from dataclasses import dataclass
import logging
from typing import Any

import numpy as np
from sklearn.ensemble import ExtraTreesRegressor, GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, r2_score


@dataclass
class ForecastResult:
    predictions: list[float]
    model_metrics: dict[str, Any]


class ForecastingError(Exception):
    pass


def chronological_split(X: np.ndarray, y: np.ndarray, test_ratio: float = 0.2) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    if len(X) < 20:
        raise ForecastingError("Not enough training samples to build forecast model.")

    split_index = int(len(X) * (1 - test_ratio))
    split_index = max(10, min(split_index, len(X) - 10))
    if split_index <= 0 or split_index >= len(X):
        raise ForecastingError("Unable to create chronological train/test split.")

    return X[:split_index], X[split_index:], y[:split_index], y[split_index:]


def build_dataset(aqi_history: list[float], window_size: int) -> tuple[np.ndarray, np.ndarray]:
    X, y = [], []
    for i in range(len(aqi_history) - window_size):
        X.append(aqi_history[i : i + window_size])
        y.append(aqi_history[i + window_size])
    return np.array(X, dtype=float), np.array(y, dtype=float)


def train_and_forecast(aqi_history: list[float], forecast_days: int = 5, window_size: int = 14) -> ForecastResult:
    logger = logging.getLogger(__name__)

    X, y = build_dataset(aqi_history, window_size=window_size)
    X_train, X_test, y_train, y_test = chronological_split(X, y)

    models = {
        "RandomForest": RandomForestRegressor(n_estimators=120, random_state=42, max_depth=10),
        "GradientBoosting": GradientBoostingRegressor(n_estimators=100, random_state=42, max_depth=5, learning_rate=0.05),
        "ExtraTrees": ExtraTreesRegressor(n_estimators=120, random_state=42, max_depth=10),
        "Ridge": Ridge(alpha=1.0),
    }

    trained_models: dict[str, Any] = {}
    model_maes: dict[str, float] = {}

    for name, model in models.items():
        try:
            model.fit(X_train, y_train)
            preds = model.predict(X_test)
            mae_val = float(mean_absolute_error(y_test, preds))
            trained_models[name] = model
            model_maes[name] = max(0.001, mae_val)
        except Exception:
            logger.exception("Model training failed for %s", name)

    if not trained_models:
        raise ForecastingError("Unable to train forecasting models.")

    inverse_mae = {name: 1.0 / mae for name, mae in model_maes.items()}
    total_weight = sum(inverse_mae.values())
    weights = {name: value / total_weight for name, value in inverse_mae.items()}

    test_predictions = np.zeros_like(y_test, dtype=float)
    for name, model in trained_models.items():
        test_predictions += weights[name] * model.predict(X_test)

    baseline_predictions = X_test[:, -1]
    ensemble_mae = float(mean_absolute_error(y_test, test_predictions))
    ensemble_r2 = float(r2_score(y_test, test_predictions))
    baseline_mae = float(mean_absolute_error(y_test, baseline_predictions))

    rolling_window = list(aqi_history[-window_size:])
    future_predictions: list[float] = []

    for _ in range(forecast_days):
        next_value = 0.0
        for name, model in trained_models.items():
            next_value += weights[name] * float(model.predict([rolling_window])[0])
        next_value = max(0.0, next_value)
        future_predictions.append(next_value)
        rolling_window.pop(0)
        rolling_window.append(next_value)

    return ForecastResult(
        predictions=future_predictions,
        model_metrics={
            "r2": round(ensemble_r2, 4),
            "mae": round(ensemble_mae, 2),
            "baseline_mae": round(baseline_mae, 2),
            "validation_method": "chronological_holdout",
            "window_size_days": window_size,
            "train_samples": int(len(X_train)),
            "test_samples": int(len(X_test)),
        },
    )
