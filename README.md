
<h1 align="center">🧠 SentimentIQ</h1>

<h3 align="center">
Intelligent Sentiment Analysis Platform
</h3>

<p align="center">
Transforming text into meaningful insights.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/NLP-VADER-6C63FF?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

---

## Overview

SentimentIQ is a natural language processing platform designed to analyse English text and classify sentiment as positive, negative or neutral.

The project combines sentiment analysis, REST API development and automated software testing to demonstrate practical software engineering and artificial intelligence concepts.

---

## Application Demo

SentimentIQ provides an interactive dashboard for real-time
sentiment analysis, combining a modern React interface
with a Python FastAPI backend.

### Positive Sentiment Analysis

The application identifies positive emotions in English text
and displays the compound sentiment score and sentiment breakdown.

![Positive Sentiment Analysis](docs/images/positive-result.png)

### Negative Sentiment Analysis

Negative text is classified using the VADER NLP engine,
with visual indicators representing the sentiment scores.

![Negative Sentiment Analysis](docs/images/negative-result.png)

### Neutral Sentiment Analysis

Neutral statements are analysed and classified based on
their compound sentiment score.

![Neutral Sentiment Analysis](docs/images/neutral-result.png)

### Dashboard Features

- Real-time sentiment analysis
- Interactive text input
- Positive, negative and neutral classification
- Visual sentiment breakdown
- Compound sentiment scoring
- Character counter and input validation
- Responsive dark-themed interface
- Frontend and backend API integration

---


## Current Features

- English text sentiment analysis
- Positive, negative and neutral classification
- Compound sentiment scoring
- RESTful API using FastAPI
- Interactive Swagger API documentation
- Input validation and error handling
- Automated unit and API testing

## Technology Stack

<p>
  <img src="https://skillicons.dev/icons?i=python,fastapi,git,github,vscode" />
</p>

| Technology | Purpose |
| --- | --- |
| Python | Core programming language |
| VADER | Rule-based sentiment analysis |
| FastAPI | REST API development |
| Uvicorn | Application server |
| Pytest | Automated testing |
| HTTPX | API testing |

## System Architecture

```mermaid
flowchart TD
    A[User Input] --> B[FastAPI REST API]
    B --> C[Input Validation]
    C --> D[VADER Sentiment Engine]
    D --> E[Sentiment Classification]
    E --> F[JSON Response]
```

## Project Structure

```text
SentimentIQ/
├── backend/
│   ├── __init__.py
│   ├── main.py
│   └── sentiment.py
├── tests/
│   └── test_sentiment.py
├── requirements.txt
├── .gitignore
├── LICENSE
└── README.md
```

## Installation

Clone the repository:

```bash
git clone https://github.com/oraln21/SentimentIQ.git
cd SentimentIQ
```

Create a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the dependencies:

```bash
python -m pip install -r requirements.txt
```

## Running the Application

```bash
python -m uvicorn backend.main:app --reload --port 8001
```

Open the interactive API documentation:

http://127.0.0.1:8001/docs

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | / | Application information |
| GET | /health | Health check |
| POST | /analyze | Analyse text sentiment |

### Example Request

```json
{
  "text": "I absolutely love this product!"
}
```

### Example Response

```json
{
  "text": "I absolutely love this product!",
  "sentiment": "Positive",
  "scores": {
    "positive": 0.545,
    "neutral": 0.455,
    "negative": 0.0,
    "compound": 0.6989
  }
}
```

## Automated Testing

Run the test suite:

```bash
python -m pytest -v
```

Initial local test results:

- 10 tests passed
- 0 tests failed
- 1 dependency deprecation warning

---

## Machine Learning Model

SentimentIQ includes a custom-trained supervised
machine learning model using TF-IDF feature extraction
and Logistic Regression.

The model is benchmarked against the VADER rule-based
sentiment analysis engine.

### Dataset

- Dataset: Financial PhraseBank (sentences_allagree)
- Total cleaned records: 2,259
- Training samples: 1,807
- Testing samples: 452
- Training/testing split: 80/20
- Classification: Positive, Negative and Neutral
- Random seed: 42

### Machine Learning Pipeline

```mermaid
flowchart TD
    A[Financial PhraseBank Dataset] --> B[Data Cleaning]
    B --> C[Stratified Train Test Split]
    C --> D[TF-IDF Vectorization]
    D --> E[Logistic Regression]
    E --> F[Model Evaluation]
    F --> G[Performance Comparison]
```

### Model Performance

Both approaches were evaluated using the same
held-out test dataset.

| Metric | Logistic Regression | VADER |
| --- | ---: | ---: |
| Accuracy | 88.72% | 56.86% |
| Macro Precision | 84.62% | 54.79% |
| Macro Recall | 85.56% | 50.92% |
| Macro F1-score | 85.08% | 48.74% |

The custom-trained model achieved an accuracy
improvement of approximately 31.86 percentage
points over the VADER baseline on this dataset.

### Performance Comparison

![Model Performance](docs/evaluation/model-comparison.png)

### Logistic Regression Confusion Matrix

![ML Confusion Matrix](docs/evaluation/ml-confusion-matrix.png)

### VADER Confusion Matrix

![VADER Confusion Matrix](docs/evaluation/vader-confusion-matrix.png)

### Reproducing the Experiment

```bash
python ml/prepare_data.py
python ml/train_model.py
python -m ml.evaluate_model
```

### Research Limitations

- The dataset focuses on financial English text.
- Results may not generalise to other text domains.
- Class imbalance is addressed using balanced
  class weights.
- Further evaluation on independent datasets is needed.
- Dataset and trained model files are excluded from
  the public repository due to licensing considerations.
- The trained model is not yet integrated into the
  web application.

---


## Limitations

- Currently designed for English text.
- VADER uses a rule-based approach.
- Sentiment scores are not calibrated confidence probabilities.
- Sarcasm and complex contextual meaning may reduce accuracy.


## Development Roadmap

- [x] Project architecture
- [x] NLP sentiment analysis engine
- [x] FastAPI backend
- [x] Input validation and error handling
- [x] Automated backend testing
- [x] React and TypeScript frontend
- [x] Responsive user interface
- [x] Frontend and backend integration
- [x] Sentiment data visualisation
- [x] Production build
- [x] Application screenshots
- [x] Dataset preparation and preprocessing
- [x] TF-IDF feature extraction
- [x] Custom machine learning model training
- [x] Model performance evaluation
- [x] VADER and Logistic Regression comparison
- [x] Confusion matrix visualisation
- [ ] Machine learning API integration
- [ ] Interactive model selection
- [ ] Automated frontend testing
- [ ] GitHub Actions CI/CD
- [ ] Public application deployment


## Author

**Nilay Oral**

Software Engineering Student | AI & Machine Learning

[GitHub Profile](https://github.com/oraln21)

## License

This project is licensed under the MIT License.

---

<p align="center">
  Built with curiosity, code and continuous learning.
</p>
