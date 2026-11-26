
from fastapi.testclient import TestClient

from backend import main

client = TestClient(main.app)


def test_features_with_model(monkeypatch, tmp_path):
    model_path = tmp_path / "sentiment_model.joblib"
    model_path.touch()

    monkeypatch.setattr(main, "MODEL_PATH", model_path)

    response = client.get("/api/features")

    assert response.status_code == 200
    assert response.json() == {
        "vader": True,
        "machine_learning": True,
        "comparison": True,
    }


def test_features_without_model(monkeypatch, tmp_path):
    model_path = tmp_path / "missing_model.joblib"

    monkeypatch.setattr(main, "MODEL_PATH", model_path)

    response = client.get("/api/features")

    assert response.status_code == 200
    assert response.json() == {
        "vader": True,
        "machine_learning": False,
        "comparison": False,
    }


def test_feature_routes_are_consistent():
    public_response = client.get("/features")
    production_response = client.get("/api/features")

    assert public_response.status_code == 200
    assert production_response.status_code == 200
    assert public_response.json() == production_response.json()
