from __future__ import annotations

from typing import Sequence
import numpy as np


def calculate_sub_aqi(cp: float, breakpoints: Sequence[tuple[tuple[float, float], tuple[int, int]]]) -> int:
    for (cp_low, cp_high), (aqi_low, aqi_high) in breakpoints:
        if cp_low <= cp <= cp_high:
            aqi = ((aqi_high - aqi_low) / (cp_high - cp_low)) * (cp - cp_low) + aqi_low
            return round(aqi)

    if breakpoints and cp > breakpoints[-1][0][1]:
        cp_low, cp_high = breakpoints[-1][0]
        aqi_low, aqi_high = breakpoints[-1][1]
        aqi = ((aqi_high - aqi_low) / (cp_high - cp_low)) * (cp - cp_low) + aqi_low
        return min(500, round(aqi))
    return 0


def get_us_aqi(pm2_5: float, pm10: float, co_ug: float, no2_ug: float, so2_ug: float, o3_ug: float) -> int:
    c_pm25 = np.floor(pm2_5 * 10) / 10.0
    c_pm10 = np.floor(pm10)
    c_co = np.floor((co_ug / 1145.0) * 10) / 10.0
    c_o3 = np.floor((o3_ug / 1960.0) * 1000) / 1000.0
    c_no2 = np.floor(no2_ug / 1.88)
    c_so2 = np.floor(so2_ug / 2.62)

    pm25_bp = [((0.0, 9.0), (0, 50)), ((9.1, 35.4), (51, 100)), ((35.5, 55.4), (101, 150)), ((55.5, 125.4), (151, 200)), ((125.5, 225.4), (201, 300)), ((225.5, 325.4), (301, 400)), ((325.5, 500.4), (401, 500))]
    pm10_bp = [((0, 54), (0, 50)), ((55, 154), (51, 100)), ((155, 254), (101, 150)), ((255, 354), (151, 200)), ((355, 424), (201, 300)), ((425, 504), (301, 400)), ((505, 604), (401, 500))]
    co_bp = [((0.0, 4.4), (0, 50)), ((4.5, 9.4), (51, 100)), ((9.5, 12.4), (101, 150)), ((12.5, 15.4), (151, 200)), ((15.5, 30.4), (201, 300)), ((30.5, 40.4), (301, 400)), ((40.5, 50.4), (401, 500))]
    o3_bp = [((0.000, 0.054), (0, 50)), ((0.055, 0.070), (51, 100)), ((0.071, 0.085), (101, 150)), ((0.086, 0.105), (151, 200)), ((0.106, 0.200), (201, 300)), ((0.201, 0.604), (301, 500))]
    no2_bp = [((0, 53), (0, 50)), ((54, 100), (51, 100)), ((101, 360), (101, 150)), ((361, 649), (151, 200)), ((650, 1249), (201, 300)), ((1250, 1649), (301, 400)), ((1650, 2049), (401, 500))]
    so2_bp = [((0, 35), (0, 50)), ((36, 75), (51, 100)), ((76, 185), (101, 150)), ((186, 304), (151, 200)), ((305, 604), (201, 300)), ((605, 804), (301, 400)), ((805, 1004), (401, 500))]

    return max(
        calculate_sub_aqi(c_pm25, pm25_bp),
        calculate_sub_aqi(c_pm10, pm10_bp),
        calculate_sub_aqi(c_co, co_bp),
        calculate_sub_aqi(c_o3, o3_bp),
        calculate_sub_aqi(c_no2, no2_bp),
        calculate_sub_aqi(c_so2, so2_bp),
    )


def get_aqi_category(aqi: float) -> str:
    if aqi <= 50:
        return "Good"
    if aqi <= 100:
        return "Moderate"
    if aqi <= 150:
        return "Unhealthy (Sensitive)"
    if aqi <= 200:
        return "Unhealthy"
    if aqi <= 300:
        return "Very Unhealthy"
    return "Hazardous"


def interpolate_series_with_flags(series: list[float | None]) -> tuple[list[float | None], list[bool], int, int]:
    observed_count = sum(1 for value in series if value is not None)
    estimated_flags = [value is None for value in series]
    if observed_count == 0:
        return list(series), estimated_flags, 0, len(series)

    result = list(series)
    known_indices = [i for i, value in enumerate(result) if value is not None]
    first_idx, last_idx = known_indices[0], known_indices[-1]

    for i in range(0, first_idx):
        result[i] = result[first_idx]
    for i in range(last_idx + 1, len(result)):
        result[i] = result[last_idx]

    pointer = first_idx
    while pointer < last_idx:
        if result[pointer] is not None:
            pointer += 1
            continue
        left = pointer - 1
        right = pointer
        while right <= last_idx and result[right] is None:
            right += 1
        if right > last_idx:
            break
        left_val = float(result[left])
        right_val = float(result[right])
        span = right - left
        for idx in range(left + 1, right):
            weight = (idx - left) / span
            result[idx] = left_val + weight * (right_val - left_val)
        pointer = right

    interpolated_count = sum(1 for idx, original in enumerate(series) if original is None and result[idx] is not None)
    return result, estimated_flags, observed_count, interpolated_count
