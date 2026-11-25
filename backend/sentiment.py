
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


analyzer = SentimentIntensityAnalyzer()


def analyze_sentiment(text: str) -> dict:
    """Analyze the sentiment of an English text."""

    if not text.strip():
        raise ValueError("Text cannot be empty.")

    scores = analyzer.polarity_scores(text)
    compound = scores["compound"]

    if compound >= 0.05:
        sentiment = "Positive"
    elif compound <= -0.05:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"

    return {
        "text": text,
        "sentiment": sentiment,
        "scores": {
            "positive": scores["pos"],
            "neutral": scores["neu"],
            "negative": scores["neg"],
            "compound": compound,
        },
    }


if __name__ == "__main__":
    examples = [
        "I absolutely love this product!",
        "This is a terrible experience.",
        "The package arrived on Monday.",
    ]

    for example in examples:
        result = analyze_sentiment(example)
        print(result)
