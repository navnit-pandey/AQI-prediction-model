import unittest

from backend import create_app


class TestApiValidation(unittest.TestCase):
    def setUp(self) -> None:
        self.app = create_app()
        self.client = self.app.test_client()

    def test_healthz(self) -> None:
        response = self.client.get("/healthz")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["status"], "ok")

    def test_predict_rejects_non_json_object(self) -> None:
        response = self.client.post("/api/predict", json=["Delhi"])
        self.assertEqual(response.status_code, 400)

    def test_predict_rejects_missing_city(self) -> None:
        response = self.client.post("/api/predict", json={})
        self.assertEqual(response.status_code, 400)


if __name__ == "__main__":
    unittest.main()
