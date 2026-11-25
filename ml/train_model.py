
from pathlib import Path

import joblib
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline


ROOT_DIR = Path(__file__).resolve().parents[1]

DATA_DIR = ROOT_DIR / "data"
MODEL_DIR = ROOT_DIR / "models"

MODEL_PATH = MODEL_DIR / "sentiment_model.joblib"


def train_model():
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    print("Loading training dataset...")

    train_df = pd.read_csv(DATA_DIR / "train.csv")

    X_train = train_df["text"]
    y_train = train_df["label"]

    print(f"Training samples: {len(X_train)}")

    pipeline = Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                lowercase=True,
                ngram_range=(1, 2),
                max_features=20000,
                sublinear_tf=True,
            ),
        ),
        (
            "classifier",
            LogisticRegression(
                max_iter=1000,
                class_weight="balanced",
                random_state=42,
            ),
        ),
    ])

    print("\nTraining machine learning model...")

    pipeline.fit(X_train, y_train)

    print("Model training completed successfully.")

    joblib.dump(pipeline, MODEL_PATH)

    print(f"\nModel saved to: {MODEL_PATH}")

    examples = [
        "The company's profits increased significantly.",
        "The company reported substantial financial losses.",
        "The report was published on Monday.",
    ]

    print("\nSample predictions:")
    print("-" * 50)

    for text in examples:
        prediction = pipeline.predict([text])[0]

        print(f"Text: {text}")
        print(f"Prediction: {prediction}")
        print("-" * 50)


if __name__ == "__main__":
    train_model()
