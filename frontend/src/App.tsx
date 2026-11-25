
import { useState } from 'react'
import './App.css'

type AnalysisResult = {
  text: string
  sentiment: 'Positive' | 'Negative' | 'Neutral'
  scores: {
    positive: number
    neutral: number
    negative: number
    compound: number
  }
}

const examples = [
  'I absolutely love this application!',
  'This was a terrible experience.',
  'The package arrived on Monday.',
]

function App() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function analyzeText() {
    if (!text.trim() || loading) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('Unable to analyze the text.')
      }

      const data: AnalysisResult = await response.json()
      setResult(data)
    } catch {
      setError(
        'Analysis failed. Please check that the backend server is running.'
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
        <span className="badge">NLP ENGINE</span>
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
            Transform unstructured text into meaningful
            sentiment insights with intelligent language analysis.
          </p>
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
            onChange={(event) => updateText(event.target.value)}
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
            disabled={loading || !text.trim()}
          >
            {loading ? 'Analyzing...' : 'Analyze Sentiment →'}
          </button>

          <div className="examples">
            <span>Try an example:</span>
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

        <section aria-live="polite">
          {result ? (
            <>
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

              <div className="panel breakdown">
                <h2>Sentiment Breakdown</h2>

                {(['positive', 'neutral', 'negative'] as const)
                  .map((name) => (
                    <div className="metric" key={name}>
                      <div className="metric-header">
                        <span>{name}</span>
                        <strong>
                          {(result.scores[name] * 100).toFixed(1)}%
                        </strong>
                      </div>
                      <div className="track">
                        <div
                          className={`fill ${name}`}
                          style={{
                            width: `${result.scores[name] * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}

                <small className="note">
                  VADER sentiment scores are not confidence
                  probabilities.
                </small>
              </div>
            </>
          ) : (
            <div className="panel empty-state">
              <h3>Analysis results</h3>
              <p>
                Your sentiment insights will appear here
                after analysis.
              </p>
            </div>
          )}
        </section>
      </main>

      <footer>
        SentimentIQ · Python · FastAPI · React · NLP
        <br />
        Designed for intelligent text analysis.
      </footer>
    </div>
  )
}

export default App
