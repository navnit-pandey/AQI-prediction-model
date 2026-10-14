import unittest

from backend.aqi import get_aqi_category, get_us_aqi, interpolate_series_with_flags


class TestAqiDomain(unittest.TestCase):
    def test_us_aqi_reasonable_value(self) -> None:
        aqi = get_us_aqi(pm2_5=12.0, pm10=40.0, co_ug=500, no2_ug=20, so2_ug=10, o3_ug=60)
        self.assertGreaterEqual(aqi, 0)
        self.assertLessEqual(aqi, 500)

    def test_aqi_category_threshold(self) -> None:
        self.assertEqual(get_aqi_category(35), "Good")
        self.assertEqual(get_aqi_category(120), "Unhealthy (Sensitive)")

    def test_interpolation_all_missing_keeps_unavailable(self) -> None:
        interpolated, estimated_flags, observed, interpolated_count = interpolate_series_with_flags([None, None, None])
        self.assertEqual(interpolated, [None, None, None])
        self.assertEqual(observed, 0)
        self.assertEqual(interpolated_count, 3)
        self.assertEqual(estimated_flags, [True, True, True])


if __name__ == "__main__":
    unittest.main()
