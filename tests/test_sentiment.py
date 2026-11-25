
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.sentiment import analyze_sentiment


client = TestClient(app)


def test_positive_sentiment():
    result = analyze_sentiment("I love this amazing product!")
    assert result["sentiment"] == "Positive"


def test_negative_sentiment():
    result = analyze_sentiment("This is a terrible experience.")
    assert result["sentiment"] == "Negative"


def test_neutral_sentiment():
    result = analyze_sentiment("The package arrived on Monday.")
    assert result["sentiment"] == "Neutral"


def test_empty_text():
    with pytest.raises(ValueError):
        analyze_sentiment("")


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_home_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["application"] == "SentimentIQ"


def test_analyze_endpoint():
    response = client.post(
        "/analyze",
        json={"text": "I love this application!"}
    )

    assert response.status_code == 200
    assert response.json()["sentiment"] == "Positive"


def test_invalid_request():
    response = client.post(
        "/analyze",
        json={"text": ""}
    )

    assert response.status_code == 422


def test_whitespace_request():
    response = client.post(
        "/analyze",
        json={"text": "   "}
    )

    assert response.status_code == 400


def test_text_length_limit():
    response = client.post(
        "/analyze",
        json={"text": "a" * 5001}
    )

    assert response.status_code == 422
