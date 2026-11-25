
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from backend.sentiment import analyze_sentiment


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
