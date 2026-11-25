
from pathlib import Path

import joblib
import pandas as pd
import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)

from backend.sentiment import analyze_sentiment


ROOT_DIR = Path(__file__).resolve().parents[1]

DATA_DIR = ROOT_DIR / "data"
MODEL_DIR = ROOT_DIR / "models"
REPORT_DIR = ROOT_DIR / "docs" / "evaluation"

LABELS = ["Negative", "Neutral", "Positive"]


def calculate_metrics(name, actual, predicted):
    return {
        "Model": name,
        "Accuracy": accuracy_score(actual, predicted),
        "Precision": precision_score(
            actual, predicted,
            average="macro",
            zero_division=0,
        ),
        "Recall": recall_score(
            actual, predicted,
            average="macro",
            zero_division=0,
        ),
        "F1-score": f1_score(
            actual, predicted,
            average="macro",
            zero_division=0,
        ),
    }


def save_confusion_matrix(actual, predicted, name, filename):
    matrix = confusion_matrix(
        actual,
        predicted,
        labels=LABELS,
    )

    plt.figure(figsize=(8, 6))

    sns.heatmap(
        matrix,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=LABELS,
        yticklabels=LABELS,
    )

    plt.title(f"{name} - Confusion Matrix")
    plt.xlabel("Predicted Sentiment")
    plt.ylabel("Actual Sentiment")
    plt.tight_layout()

    plt.savefig(
        REPORT_DIR / filename,
        dpi=200,
        bbox_inches="tight",
    )

    plt.close()


def evaluate_models():
    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    print("Loading test dataset...")

    test_df = pd.read_csv(DATA_DIR / "test.csv")

    X_test = test_df["text"]
    y_test = test_df["label"]

    print(f"Testing samples: {len(X_test)}")

    model = joblib.load(
        MODEL_DIR / "sentiment_model.joblib"
    )

    print("\nEvaluating Logistic Regression...")

    ml_predictions = model.predict(X_test)

    print("Evaluating VADER...")

    vader_predictions = [
        analyze_sentiment(text)["sentiment"]
        for text in X_test
    ]

    results = pd.DataFrame([
        calculate_metrics(
            "Logistic Regression",
            y_test,
            ml_predictions,
        ),
        calculate_metrics(
            "VADER",
            y_test,
            vader_predictions,
        ),
    ])

    print("\nMODEL PERFORMANCE COMPARISON")
    print("=" * 65)
    print(results.round(4).to_string(index=False))

    print("\nLOGISTIC REGRESSION REPORT")
    print(classification_report(
        y_test,
        ml_predictions,
        labels=LABELS,
        zero_division=0,
    ))

    print("\nVADER REPORT")
    print(classification_report(
        y_test,
        vader_predictions,
        labels=LABELS,
        zero_division=0,
    ))

    results.to_csv(
        REPORT_DIR / "model_comparison.csv",
        index=False,
    )

    save_confusion_matrix(
        y_test,
        ml_predictions,
        "Logistic Regression",
        "ml-confusion-matrix.png",
    )

    save_confusion_matrix(
        y_test,
        vader_predictions,
        "VADER",
        "vader-confusion-matrix.png",
    )

    chart = results.set_index("Model").plot(
        kind="bar",
        figsize=(10, 6),
        color=[
            "#2563eb",
            "#7c3aed",
            "#16a34a",
            "#f59e0b",
        ],
    )

    chart.set_title("SentimentIQ - Model Performance")
    chart.set_ylabel("Score")
    chart.set_ylim(0, 1)
    chart.set_xticklabels(
        chart.get_xticklabels(),
        rotation=0,
    )

    plt.legend(loc="upper right")
    plt.tight_layout()

    plt.savefig(
        REPORT_DIR / "model-comparison.png",
        dpi=200,
        bbox_inches="tight",
    )

    plt.close()

    print("\nEvaluation completed successfully.")
    print(f"Reports saved to: {REPORT_DIR}")


if __name__ == "__main__":
    evaluate_models()
