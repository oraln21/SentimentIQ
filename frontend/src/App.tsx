import { useEffect, useState } from 'react'
import './App.css'

type Sentiment = 'Positive' | 'Negative' | 'Neutral'
type Engine = 'vader' | 'ml' | 'both'

type SentimentScores = {
  positive: number
  neutral: number
  negative: number
}

type VaderResult = {
  text: string
  sentiment: Sentiment
  scores: SentimentScores & {
    compound: number
  }
}

type MLResult = {
  text: string
  model: string
  sentiment: Sentiment
  confidence: number
  probabilities: SentimentScores
}

type ComparisonResult = {
  text: string
  vader: VaderResult
  machine_learning: MLResult
  agreement: boolean
}

type AnalysisResult =
  | { engine: 'vader'; data: VaderResult }
  | { engine: 'ml'; data: MLResult }
  | { engine: 'both'; data: ComparisonResult }

const examples = [
  "The company's profits increased significantly.",
  'The company reported substantial financial losses.',
  'The report was published on Monday.',
]

const engines = [
  {
    value: 'vader',
    title: 'VADER NLP',
    description: 'Rule-based sentiment analysis',
  },
  {
    value: 'ml',
    title: 'Machine Learning',
    description: 'Custom-trained Logistic Regression',
  },
  {
    value: 'both',
    title: 'Compare Both Models',
    description: 'Side-by-side comparative analysis',
  },
] as const

const endpoints: Record<Engine, string> = {
  vader: '/api/analyze',
  ml: '/api/analyze/ml',
  both: '/api/analyze/compare',
}

function ScoreBreakdown({
  scores,
  title,
  note,
}: {
  scores: SentimentScores
  title: string
  note: string
}) {
  return (
    <div className="panel breakdown">
      <h2>{title}</h2>

      {(['positive', 'neutral', 'negative'] as const).map(
        (name) => (
          <div className="metric" key={name}>
            <div className="metric-header">
              <span>{name}</span>
              <strong>
                {(scores[name] * 100).toFixed(1)}%
              </strong>
            </div>

            <div className="track">
              <div
                className={`fill ${name}`}
                style={{
                  width: `${scores[name] * 100}%`,
                }}
              />
            </div>
          </div>
        )
      )}

      <small className="note">{note}</small>
    </div>
  )
}

function VaderCard({ result }: { result: VaderResult }) {
  return (
    <div className="engine-result">
      <div className="engine-heading">
        <h2>VADER NLP</h2>
        <span>Rule-based analysis</span>
      </div>

      <div className="results-grid">
        <div className="panel">
          <span className="metric-label">
            DETECTED SENTIMENT
          </span>
          <h2 className={result.sentiment.toLowerCase()}>
            {result.sentiment}
          </h2>
        </div>

        <div className="panel">
          <span className="metric-label">
            COMPOUND SCORE
          </span>
          <h2 className="score">
            {result.scores.compound.toFixed(4)}
          </h2>
        </div>
      </div>

      <ScoreBreakdown
        scores={result.scores}
        title="Sentiment Breakdown"
        note="VADER sentiment scores are not confidence probabilities."
      />
    </div>
  )
}

function MLCard({ result }: { result: MLResult }) {
  return (
    <div className="engine-result">
      <div className="engine-heading">
        <h2>Logistic Regression</h2>
        <span>Machine learning analysis</span>
      </div>

      <div className="results-grid">
        <div className="panel">
          <span className="metric-label">
            DETECTED SENTIMENT
          </span>
          <h2 className={result.sentiment.toLowerCase()}>
            {result.sentiment}
          </h2>
        </div>

        <div className="panel">
          <span className="metric-label">
            ESTIMATED PROBABILITY
          </span>
          <h2 className="score">
            {(result.confidence * 100).toFixed(2)}%
          </h2>
        </div>
      </div>

      <ScoreBreakdown
        scores={result.probabilities}
        title="Class Probabilities"
        note="Estimated model probabilities are not guarantees of correctness. The model was trained on financial English text."
      />
    </div>
  )
}

function App() {
  const [text, setText] = useState('')
  const [engine, setEngine] = useState<Engine>('both')
  const [result, setResult] =
    useState<AnalysisResult | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [mlAvailable, setMlAvailable] = useState(false)
  const [checkingFeatures, setCheckingFeatures] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function checkFeatures() {
      try {
        const response = await fetch('/api/features', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Unable to check features.')
        }

        const data = await response.json()

        const available =
          data.machine_learning === true &&
          data.comparison === true

        setMlAvailable(available)
        setEngine(available ? 'both' : 'vader')
      } catch {
        if (controller.signal.aborted) return

        setMlAvailable(false)
        setEngine('vader')
      } finally {
        if (!controller.signal.aborted) {
          setCheckingFeatures(false)
        }
      }
    }

    void checkFeatures()

    return () => controller.abort()
  }, [])



  async function analyzeText() {
    if (
  !text.trim() ||
  loading ||
  checkingFeatures ||
  (engine !== 'vader' && !mlAvailable)
) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(endpoints[engine], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (response.status === 503) {
        throw new Error(
          'Machine learning model unavailable. Train the model locally first.'
        )
      }

      if (!response.ok) {
        throw new Error(
          `Analysis failed (HTTP ${response.status}).`
        )
      }

      const data = await response.json()

      if (engine === 'vader') {
        setResult({ engine: 'vader', data })
      } else if (engine === 'ml') {
        setResult({ engine: 'ml', data })
      } else {
        setResult({ engine: 'both', data })
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Analysis failed. Check the backend server.'
      )
    } finally {
      setLoading(false)
    }
  }

  function updateText(value: string) {
    setText(value)
    setResult(null)
    setError('')
  }

  function updateEngine(value: Engine) {
    setEngine(value)
    setResult(null)
    setError('')
  }

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <div className="logo">S</div>
          <div>
            <strong>SentimentIQ</strong>
            <small>INTELLIGENT TEXT ANALYTICS</small>
          </div>
        </div>

        <span className="badge">
  {checkingFeatures
    ? 'CHECKING ENGINES'
    : mlAvailable
      ? 'DUAL ENGINE'
      : 'VADER DEMO'}
</span>
      </header>

      <main className="container">
        <section className="hero">
          <span className="eyebrow">
            NATURAL LANGUAGE PROCESSING
          </span>

          <h1>
            Understand the emotion
            <br />
            <span>behind words.</span>
          </h1>

          <p>
            Explore intelligent sentiment insights using
            rule-based NLP and machine learning.
          </p>
        </section>

        <section className="panel">
          <h2>Select Analysis Engine</h2>

          <fieldset className="engine-options">
            <legend>Choose a sentiment analysis method</legend>

            {engines.map((item) => (
              <label
                key={item.value}
                className={`engine-option ${
                  engine === item.value ? 'selected' : ''
                }`}
              >

<input
  type="radio"
  name="engine"
  value={item.value}
  checked={engine === item.value}
  disabled={
    loading ||
    checkingFeatures ||
    (item.value !== 'vader' && !mlAvailable)
  }
  onChange={() => updateEngine(item.value)}
/>



                <div>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </div>
              </label>
            ))}
          </fieldset>

{checkingFeatures && (
  <p className="note" role="status">
    Checking available analysis engines...
  </p>
)}

{!checkingFeatures && !mlAvailable && (
  <div className="demo-notice" role="status">
    <strong>Public Demo Mode</strong>
    <p>
      VADER sentiment analysis is available.
      Machine learning and model comparison
      require a compatible trained model.
    </p>
  </div>
)}


          {engine !== 'vader' && (
            <p className="note">
              The machine learning model was trained on
              financial English text and may be less
              accurate in other domains.
            </p>
          )}
        </section>

        <section className="panel">
          <h2>Text Analysis</h2>

          <p>Enter English text to discover its sentiment.</p>

          <label htmlFor="analysis-text">
            Your text
          </label>

          <textarea
            id="analysis-text"
            value={text}
            maxLength={5000}
            disabled={loading}
            onChange={(event) =>
              updateText(event.target.value)
            }
            placeholder="Enter your text here..."
          />

          <div className="textarea-footer">
            <span>{text.length} / 5000 characters</span>

            <button
              className="text-button"
              disabled={loading}
              onClick={() => updateText('')}
            >
              Clear text
            </button>
          </div>

          <button
            className="analyze-button"
            onClick={analyzeText}
            disabled={
              loading ||
              checkingFeatures ||
               !text.trim() ||
               (engine !== 'vader' && !mlAvailable)
              }
              >
            {loading
              ? 'Analyzing...'
              : engine === 'both'
                ? 'Compare Both Models →'
                : engine === 'ml'
                  ? 'Analyze with Machine Learning →'
                  : 'Analyze with VADER →'}
          </button>

          <div className="examples">
            <span>Try a financial example:</span>

            {examples.map((example, index) => (
              <button
                key={example}
                disabled={loading}
                onClick={() => updateText(example)}
              >
                {['Positive', 'Negative', 'Neutral'][index]}
              </button>
            ))}
          </div>

          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
        </section>

        <section aria-live="polite" aria-busy={loading}>
          {result?.engine === 'vader' && (
            <VaderCard result={result.data} />
          )}

          {result?.engine === 'ml' && (
            <MLCard result={result.data} />
          )}

          {result?.engine === 'both' && (
            <>
              <div className="comparison-grid">
                <VaderCard result={result.data.vader} />

                <MLCard
                  result={result.data.machine_learning}
                />
              </div>

              <div
                className={`panel agreement ${
                  result.data.agreement
                    ? 'agree'
                    : 'disagree'
                }`}
              >
                <h2>
                  {result.data.agreement
                    ? 'Both models agree'
                    : 'Models disagree'}
                </h2>

                <p>
                  {result.data.agreement
                    ? 'Both engines predicted the same sentiment.'
                    : 'The engines predicted different sentiments. Review the context and model limitations.'}
                </p>

                <small>
                  Agreement does not guarantee a correct
                  prediction.
                </small>
              </div>
            </>
          )}

          {!result && (
            <div className="panel empty-state">
              <h3>Analysis results</h3>
              <p>
                {loading
                  ? 'Analyzing your text...'
                  : 'Your sentiment insights will appear here after analysis.'}
              </p>
            </div>
          )}
        </section>

        <section className="panel benchmark">
          <span className="eyebrow">MODEL EVALUATION</span>

          <h2>Performance Benchmark</h2>

          <p>
            Evaluated on 452 held-out Financial PhraseBank
            test samples.
          </p>

          <div className="metric">
            <div className="metric-header">
              <span>Logistic Regression Accuracy</span>
              <strong>88.72%</strong>
            </div>

            <div className="track">
              <div
                className="fill positive"
                style={{ width: '88.72%' }}
              />
            </div>
          </div>

          <div className="metric">
            <div className="metric-header">
              <span>VADER Accuracy</span>
              <strong>56.86%</strong>
            </div>

            <div className="track">
              <div
                className="fill benchmark-vader"
                style={{ width: '56.86%' }}
              />
            </div>
          </div>

          <small className="note">
            These benchmark results are specific to the
            financial test dataset and do not represent
            guaranteed accuracy on new text.
          </small>
        </section>
      </main>

      <footer>
        SentimentIQ · Python · FastAPI · React · NLP · ML
        <br />
        Designed for intelligent text analysis.
      </footer>
    </div>
  )
}

export default App
