
import { test, expect } from '@playwright/test'

const sample = "The company's profits increased significantly."

const vaderResult = {
  text: sample,
  sentiment: 'Positive',
  scores: {
    positive: 0.625,
    neutral: 0.375,
    negative: 0,
    compound: 0.6124,
  },
}

const mlResult = {
  text: sample,
  model: 'Logistic Regression',
  sentiment: 'Positive',
  confidence: 0.5065,
  probabilities: {
    positive: 0.5065,
    neutral: 0.3958,
    negative: 0.0977,
  },
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/analyze', async (route) => {
    await route.fulfill({ json: vaderResult })
  })

  await page.route('**/api/analyze/ml', async (route) => {
    await route.fulfill({ json: mlResult })
  })

  await page.route('**/api/analyze/compare', async (route) => {
    await route.fulfill({
      json: {
        text: sample,
        vader: vaderResult,
        machine_learning: mlResult,
        agreement: true,
      },
    })
  })

  await page.goto('/')
})

test('application loads successfully', async ({ page }) => {
  await expect(
    page.getByRole('heading', {
      name: 'Understand the emotion behind words.',
    })
  ).toBeVisible()

  await expect(
    page.getByRole('heading', {
      name: 'Performance Benchmark',
    })
  ).toBeVisible()
})

test('empty input disables analysis', async ({ page }) => {
  await expect(
    page.getByRole('button', {
      name: 'Compare Both Models',
    })
  ).toBeDisabled()
})

test('VADER engine selection', async ({ page }) => {
  await page.getByRole('radio', {
    name: /VADER NLP/,
  }).check()

  await page.getByLabel('Your text').fill(sample)

  await page.getByRole('button', {
    name: /Analyze with VADER/,
  }).click()

  await expect(
    page.getByRole('heading', {
      name: 'Positive',
      exact: true,
    })
  ).toBeVisible()

  await expect(page.getByText('0.6124')).toBeVisible()
})

test('machine learning engine selection', async ({ page }) => {
  await page.getByRole('radio', {
    name: /Machine Learning/,
  }).check()

  await page.getByLabel('Your text').fill(sample)

  await page.getByRole('button', {
    name: /Analyze with Machine Learning/,
  }).click()

  await expect(page.getByText('50.65%', {
    exact: true,
  })).toBeVisible()
})

test('compare both models', async ({ page }) => {
  await page.getByLabel('Your text').fill(sample)

  await page.getByRole('button', {
    name: /Compare Both Models/,
  }).click()

  await expect(
    page.getByRole('heading', {
      name: 'VADER NLP',
      exact: true,
    })
  ).toBeVisible()

  await expect(
    page.getByRole('heading', {
      name: 'Logistic Regression',
      exact: true,
    })
  ).toBeVisible()

  await expect(
    page.getByRole('heading', {
      name: 'Both models agree',
    })
  ).toBeVisible()
})

test('positive sentiment result', async ({ page }) => {
  await page.getByRole('radio', {
    name: /VADER NLP/,
  }).check()

  await page.getByLabel('Your text').fill(sample)

  await page.getByRole('button', {
    name: /Analyze with VADER/,
  }).click()

  await expect(
    page.getByRole('heading', {
      name: 'Positive',
      exact: true,
    })
  ).toBeVisible()
})

test('negative sentiment result', async ({ page }) => {
  await page.route('**/api/analyze', async (route) => {
    await route.fulfill({
      json: {
        text: 'The company reported financial losses.',
        sentiment: 'Negative',
        scores: {
          positive: 0,
          neutral: 0.4,
          negative: 0.6,
          compound: -0.85,
        },
      },
    })
  })

  await page.getByRole('radio', {
    name: /VADER NLP/,
  }).check()

  await page.getByLabel('Your text')
    .fill('The company reported financial losses.')

  await page.getByRole('button', {
    name: /Analyze with VADER/,
  }).click()

  await expect(
    page.getByRole('heading', {
      name: 'Negative',
      exact: true,
    })
  ).toBeVisible()
})

test('neutral sentiment result', async ({ page }) => {
  await page.route('**/api/analyze', async (route) => {
    await route.fulfill({
      json: {
        text: 'The report was published on Monday.',
        sentiment: 'Neutral',
        scores: {
          positive: 0,
          neutral: 1,
          negative: 0,
          compound: 0,
        },
      },
    })
  })

  await page.getByRole('radio', {
    name: /VADER NLP/,
  }).check()

  await page.getByLabel('Your text')
    .fill('The report was published on Monday.')

  await page.getByRole('button', {
    name: /Analyze with VADER/,
  }).click()

  await expect(
    page.getByRole('heading', {
      name: 'Neutral',
      exact: true,
    })
  ).toBeVisible()
})

test('model disagreement is displayed', async ({ page }) => {
  await page.route('**/api/analyze/compare', async (route) => {
    await route.fulfill({
      json: {
        text: sample,
        vader: vaderResult,
        machine_learning: {
          ...mlResult,
          sentiment: 'Neutral',
          confidence: 0.6,
          probabilities: {
            positive: 0.3,
            neutral: 0.6,
            negative: 0.1,
          },
        },
        agreement: false,
      },
    })
  })

  await page.getByLabel('Your text').fill(sample)

  await page.getByRole('button', {
    name: /Compare Both Models/,
  }).click()

  await expect(
    page.getByRole('heading', {
      name: 'Models disagree',
    })
  ).toBeVisible()
})

test('clear text functionality', async ({ page }) => {
  await page.getByLabel('Your text').fill(sample)

  await page.getByRole('button', {
    name: 'Clear text',
  }).click()

  await expect(
    page.getByLabel('Your text')
  ).toHaveValue('')

  await expect(
    page.getByRole('button', {
      name: /Compare Both Models/,
    })
  ).toBeDisabled()
})

test('API error handling', async ({ page }) => {
  await page.route('**/api/analyze/compare', async (route) => {
    await route.fulfill({
      status: 503,
      json: {
        detail: 'Model unavailable',
      },
    })
  })

  await page.getByLabel('Your text').fill(sample)

  await page.getByRole('button', {
    name: /Compare Both Models/,
  }).click()

  await expect(page.getByRole('alert')).toContainText(
    'Machine learning model unavailable'
  )
})

test('mobile responsive layout', async ({ page }) => {
  await page.setViewportSize({
    width: 390,
    height: 844,
  })

  await page.getByLabel('Your text').fill(sample)

  await page.getByRole('button', {
    name: /Compare Both Models/,
  }).click()

  await expect(
    page.getByRole('heading', {
      name: 'Both models agree',
    })
  ).toBeVisible()

  const hasHorizontalOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth
  })

  expect(hasHorizontalOverflow).toBe(false)
})
