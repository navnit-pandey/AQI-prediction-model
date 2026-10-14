import unittest

import numpy as np

from backend.model import ForecastingError, chronological_split
from backend.schemas import ValidationError, parse_predict_payload


class TestValidation(unittest.TestCase):
    def test_predict_payload_requires_object(self) -> None:
        with self.assertRaises(ValidationError):
            parse_predict_payload([], max_city_length=80)

    def test_predict_payload_city_constraints(self) -> None:
        with self.assertRaises(ValidationError):
            parse_predict_payload({"city": " "}, max_city_length=80)

        with self.assertRaises(ValidationError):
            parse_predict_payload({"city": "x" * 81}, max_city_length=80)

        city = parse_predict_payload({"city": " Delhi "}, max_city_length=80)
        self.assertEqual(city, "Delhi")


class TestChronologicalValidation(unittest.TestCase):
    def test_chronological_split_maintains_order(self) -> None:
        X = np.arange(200).reshape(40, 5)
        y = np.arange(40)

        X_train, X_test, y_train, y_test = chronological_split(X, y)
        self.assertEqual(int(y_train[-1]) + 1, int(y_test[0]))
        self.assertTrue(np.array_equal(X_train[0], X[0]))
        self.assertTrue(np.array_equal(X_test[-1], X[-1]))

    def test_chronological_split_requires_samples(self) -> None:
        X = np.arange(60).reshape(12, 5)
        y = np.arange(12)
        with self.assertRaises(ForecastingError):
            chronological_split(X, y)


if __name__ == "__main__":
    unittest.main()
