
import pytest

from fastapi.testclient import TestClient
from unittest.mock import patch

from backend.main import app
from backend.ml_sentiment import analyze_ml_sentiment


client = TestClient(app)

SAMPLE_TEXT = (
    "The company's profits increased significantly."
)

VALID_LABELS = {"Positive", "Negative", "Neutral"}

MOCK_ML_RESULT = {
    "text": SAMPLE_TEXT,
    "model": "Logistic Regression",
    "sentiment": "Positive",
    "confidence": 0.5065,
    "probabilities": {
        "positive": 0.5065,
        "neutral": 0.3958,
        "negative": 0.0977,
    },
}


def test_ml_endpoint():
    with patch(
        "backend.main.analyze_ml_sentiment",
        return_value=MOCK_ML_RESULT,
    ):
        response = client.post(
            "/analyze/ml",
            json={"text": SAMPLE_TEXT},
        )

    assert response.status_code == 200
    assert response.json()["model"] == "Logistic Regression"


def test_ml_sentiment_label():
    with patch(
        "backend.main.analyze_ml_sentiment",
        return_value=MOCK_ML_RESULT,
    ):
        response = client.post(
            "/analyze/ml",
            json={"text": SAMPLE_TEXT},
        )

    assert response.json()["sentiment"] in VALID_LABELS


def test_ml_probability_distribution():
    with patch(
        "backend.main.analyze_ml_sentiment",
        return_value=MOCK_ML_RESULT,
    ):
        response = client.post(
            "/analyze/ml",
            json={"text": SAMPLE_TEXT},
        )

    probabilities = response.json()["probabilities"]

    assert all(
        0 <= value <= 1
        for value in probabilities.values()
    )

    assert sum(probabilities.values()) == pytest.approx(
        1.0, abs=0.001
    )


def test_compare_endpoint():
    with patch(
        "backend.main.analyze_ml_sentiment",
        return_value=MOCK_ML_RESULT,
    ):
        response = client.post(
            "/analyze/compare",
            json={"text": SAMPLE_TEXT},
        )

    assert response.status_code == 200

    data = response.json()

    assert "vader" in data
    assert "machine_learning" in data
    assert "agreement" in data


def test_model_agreement():
    with patch(
        "backend.main.analyze_ml_sentiment",
        return_value=MOCK_ML_RESULT,
    ):
        response = client.post(
            "/analyze/compare",
            json={"text": SAMPLE_TEXT},
        )

    data = response.json()

    expected = (
        data["vader"]["sentiment"]
        == data["machine_learning"]["sentiment"]
    )

    assert data["agreement"] == expected


def test_empty_text():
    response = client.post(
        "/analyze/ml",
        json={"text": ""},
    )

    assert response.status_code == 422


def test_whitespace_text():
    response = client.post(
        "/analyze/ml",
        json={"text": "   "},
    )

    assert response.status_code == 400


def test_text_length_limit():
    response = client.post(
        "/analyze/ml",
        json={"text": "a" * 5001},
    )

    assert response.status_code == 422


def test_missing_model():
    with patch(
        "backend.main.analyze_ml_sentiment",
        side_effect=FileNotFoundError("Model not found"),
    ):
        response = client.post(
            "/analyze/ml",
            json={"text": SAMPLE_TEXT},
        )

    assert response.status_code == 503


def test_local_trained_model():
    from backend.ml_sentiment import MODEL_PATH

    if not MODEL_PATH.exists():
        pytest.skip("Local trained model unavailable")

    result = analyze_ml_sentiment(SAMPLE_TEXT)

    assert result["sentiment"] in VALID_LABELS
    assert 0 <= result["confidence"] <= 1

    assert sum(
        result["probabilities"].values()
    ) == pytest.approx(1.0, abs=0.001)
