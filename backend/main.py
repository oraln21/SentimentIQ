
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from backend.sentiment import analyze_sentiment
from backend.ml_sentiment import analyze_ml_sentiment


app = FastAPI(
    title="SentimentIQ API",
    description=(
        "A sentiment analysis API for English text "
        "using natural language processing."
    ),
    version="1.0.0",
)


class SentimentRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)


@app.get("/")
def home():
    return {
        "application": "SentimentIQ",
        "version": "1.0.0",
        "status": "running",
        "message": "Welcome to SentimentIQ API",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/analyze")
def analyze(request: SentimentRequest):
    try:
        return analyze_sentiment(request.text)
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error
    


@app.post("/analyze/ml")
def analyze_machine_learning(request: SentimentRequest):
    try:
        return analyze_ml_sentiment(request.text)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=503,
            detail="Machine learning model is unavailable.",
        ) from error


@app.post("/analyze/compare")
def compare_models(request: SentimentRequest):
    try:
        vader_result = analyze_sentiment(request.text)
        ml_result = analyze_ml_sentiment(request.text)

        return {
            "text": request.text,
            "vader": vader_result,
            "machine_learning": ml_result,
            "agreement": (
                vader_result["sentiment"]
                == ml_result["sentiment"]
            ),
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=503,
            detail="Machine learning model is unavailable.",
        ) from error

