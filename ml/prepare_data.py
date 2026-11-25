
from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split


ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT_DIR / "data"

DATASET_URL = (
    "https://huggingface.co/datasets/takala/"
    "financial_phrasebank/resolve/"
    "c8f1e786b9213a3b842f7586615da0efb287b2ea/"
    "sentences_allagree/train-00000-of-00001.parquet"
)


def prepare_dataset():
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    print("Downloading Financial PhraseBank...")

    df = pd.read_parquet(DATASET_URL)

    df = df.rename(columns={"sentence": "text"})

    label_map = {
        0: "Negative",
        1: "Neutral",
        2: "Positive",
    }

    df["label"] = df["label"].map(label_map)

    df = df[["text", "label"]].dropna()

    df["text"] = df["text"].str.strip()

    df = df[df["text"] != ""]

    df = df.drop_duplicates(subset=["text"])

    train_df, test_df = train_test_split(
        df,
        test_size=0.20,
        random_state=42,
        stratify=df["label"],
    )

    train_df.to_csv(
        DATA_DIR / "train.csv",
        index=False,
    )

    test_df.to_csv(
        DATA_DIR / "test.csv",
        index=False,
    )

    print("\nDataset prepared successfully.")
    print(f"Total records: {len(df)}")
    print(f"Training records: {len(train_df)}")
    print(f"Testing records: {len(test_df)}")

    print("\nSentiment distribution:")
    print(df["label"].value_counts())

    print("\nFiles saved in the data directory.")


if __name__ == "__main__":
    prepare_dataset()
