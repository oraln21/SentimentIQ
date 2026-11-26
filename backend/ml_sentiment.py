
from pathlib import Path
from functools import lru_cache

import joblib


ROOT_DIR = Path(__file__).resolve().parents[1]

MODEL_PATH = (
    ROOT_DIR / "models" / "sentiment_model.joblib"
)


@lru_cache(maxsize=1)
def load_model():
    """Load the locally trained sentiment model."""

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            "Machine learning model not found. "
            "Run ml/train_model.py first."
        )

    return joblib.load(MODEL_PATH)


def analyze_ml_sentiment(text: str) -> dict:
    """Predict sentiment using the trained ML model."""

    if not isinstance(text, str) or not text.strip():
        raise ValueError("Text cannot be empty.")

    text = text.strip()

    if len(text) > 5000:
        raise ValueError(
            "Text cannot exceed 5000 characters."
        )

    model = load_model()

    prediction = model.predict([text])[0]

    probabilities = model.predict_proba([text])[0]

    scores = {
        str(label).lower(): round(float(probability), 4)
        for label, probability in zip(
            model.classes_, probabilities
        )
    }

    return {
        "text": text,
        "model": "Logistic Regression",
        "sentiment": str(prediction),
        "confidence": round(float(max(probabilities)), 4),
        "probabilities": scores,
    }


if __name__ == "__main__":

    examples = [
        "The company's profits increased significantly.",
        "The company reported substantial financial losses.",
        "The report was published on Monday.",
    ]

    for example in examples:
        result = analyze_ml_sentiment(example)

        print("\n" + "=" * 60)

        print(f"Text: {result['text']}")
        print(f"Model: {result['model']}")
        print(f"Sentiment: {result['sentiment']}")
        print(f"Confidence: {result['confidence']:.2%}")

        print("Class probabilities:")

        for label, score in result["probabilities"].items():
            print(f"  {label.capitalize()}: {score:.2%}")
