import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  formatMoney,
  formatNumber,
  runSimulation,
  type SimInputs,
  type SimResults,
} from './sim'

const schema = z.object({
  monthlyVisitors: z.coerce
    .number({ invalid_type_error: 'Enter a number' })
    .min(100, 'At least 100 visitors')
    .max(5_000_000, 'Keep it under 5,000,000'),
  conversionRate: z.coerce
    .number({ invalid_type_error: 'Enter a number' })
    .min(0.1, 'Minimum 0.1%')
    .max(40, 'Maximum 40%'),
  averageOrderValue: z.coerce
    .number({ invalid_type_error: 'Enter a number' })
    .min(1, 'Minimum $1')
    .max(100_000, 'Maximum $100,000'),
  monthlyAdSpend: z.coerce
    .number({ invalid_type_error: 'Enter a number' })
    .min(0, 'Cannot be negative')
    .max(2_000_000, 'Maximum $2,000,000'),
})

type FormValues = z.infer<typeof schema>

const defaults: FormValues = {
  monthlyVisitors: 12000,
  conversionRate: 2.4,
  averageOrderValue: 68,
  monthlyAdSpend: 2500,
}

function ResultsView({ results }: { results: SimResults }) {
  return (
    <section
      className={`results results--${results.profit >= 0 ? 'positive' : 'caution'}`}
      aria-live="polite"
    >
      <header className="results__head">
        <p className="eyebrow">Simulated monthly outlook</p>
        <h2>Your forecast is ready</h2>
        <p className="lede">
          These numbers are estimates based on the inputs above — not a guarantee.
          Use them to compare scenarios before you launch.
        </p>
      </header>

      <div className="metrics">
        <article className="metric metric--hero">
          <span>Projected revenue</span>
          <strong>{formatMoney(results.revenue)}</strong>
        </article>
        <article className="metric">
          <span>Estimated leads</span>
          <strong>{formatNumber(results.leads)}</strong>
        </article>
        <article className="metric">
          <span>Net after ads</span>
          <strong className={results.profit >= 0 ? 'up' : 'down'}>
            {formatMoney(results.profit)}
          </strong>
        </article>
        <article className="metric">
          <span>ROAS</span>
          <strong>{results.roas === 0 ? '—' : `${formatNumber(results.roas, 2)}x`}</strong>
        </article>
        <article className="metric">
          <span>Cost per lead</span>
          <strong>
            {results.leads === 0 ? '—' : formatMoney(results.costPerLead)}
          </strong>
        </article>
        <article className="metric">
          <span>Break-even conversion</span>
          <strong>{formatNumber(results.breakEvenConversion, 2)}%</strong>
        </article>
      </div>

      <p className="hint">
        {results.profit >= 0
          ? 'Healthy scenario: revenue covers ad spend at the current conversion rate.'
          : `To break even, aim for about ${formatNumber(results.breakEvenConversion, 2)}% conversion (or lower ad spend / higher AOV).`}
      </p>
    </section>
  )
}

export default function App() {
  const [results, setResults] = useState<SimResults | null>(null)
  const [submittedOnce, setSubmittedOnce] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
    mode: 'onBlur',
  })

  const live = watch()
  const preview = useMemo(() => {
    const parsed = schema.safeParse(live)
    if (!parsed.success) return null
    return runSimulation(parsed.data as SimInputs)
  }, [live])

  const onSubmit = (values: FormValues) => {
    setResults(runSimulation(values as SimInputs))
    setSubmittedOnce(true)
    window.requestAnimationFrame(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const onReset = () => {
    reset(defaults)
    setResults(null)
    setSubmittedOnce(false)
  }

  const shown = results ?? (submittedOnce ? null : preview)

  return (
    <div className="page">
      <div className="glow glow--a" aria-hidden />
      <div className="glow glow--b" aria-hidden />

      <header className="brand">
        <div className="brand__mark" aria-hidden />
        <div>
          <p className="brand__name">Pulse Forecast</p>
          <p className="brand__tag">Launch revenue simulator</p>
        </div>
      </header>

      <main className="shell">
        <section className="intro">
          <h1>Estimate monthly results before you spend.</h1>
          <p>
            Enter traffic, conversion, order value, and ad spend. We’ll simulate leads,
            revenue, and whether the plan covers itself — with clear guidance at each step.
          </p>
          <ol className="steps">
            <li>Fill in the four inputs (sample values are preloaded).</li>
            <li>
              Press <strong>Run simulation</strong> to lock your forecast.
            </li>
            <li>Tweak numbers and run again to compare scenarios.</li>
          </ol>
        </section>

        <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <fieldset>
            <legend>Your inputs</legend>

            <label className="field">
              <span className="field__label">Monthly website visitors</span>
              <span className="field__help">Unique visitors you expect in a typical month.</span>
              <input
                type="number"
                inputMode="numeric"
                step={100}
                {...register('monthlyVisitors')}
                aria-invalid={!!errors.monthlyVisitors}
              />
              {errors.monthlyVisitors && (
                <span className="field__error">{errors.monthlyVisitors.message}</span>
              )}
            </label>

            <label className="field">
              <span className="field__label">Conversion rate (%)</span>
              <span className="field__help">Share of visitors who buy or submit a lead.</span>
              <input
                type="number"
                inputMode="decimal"
                step={0.1}
                {...register('conversionRate')}
                aria-invalid={!!errors.conversionRate}
              />
              {errors.conversionRate && (
                <span className="field__error">{errors.conversionRate.message}</span>
              )}
            </label>

            <label className="field">
              <span className="field__label">Average order value ($)</span>
              <span className="field__help">Typical revenue per converted customer.</span>
              <input
                type="number"
                inputMode="decimal"
                step={1}
                {...register('averageOrderValue')}
                aria-invalid={!!errors.averageOrderValue}
              />
              {errors.averageOrderValue && (
                <span className="field__error">{errors.averageOrderValue.message}</span>
              )}
            </label>

            <label className="field">
              <span className="field__label">Monthly ad spend ($)</span>
              <span className="field__help">Paid ads budget for the same month (0 if organic only).</span>
              <input
                type="number"
                inputMode="decimal"
                step={50}
                {...register('monthlyAdSpend')}
                aria-invalid={!!errors.monthlyAdSpend}
              />
              {errors.monthlyAdSpend && (
                <span className="field__error">{errors.monthlyAdSpend.message}</span>
              )}
            </label>
          </fieldset>

          <div className="actions">
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              Run simulation
            </button>
            <button type="button" className="btn btn--ghost" onClick={onReset}>
              Reset sample
            </button>
          </div>
        </form>

        <div id="results">
          {shown ? (
            <ResultsView results={shown} />
          ) : (
            <section className="results results--empty">
              <p className="eyebrow">Results</p>
              <h2>Waiting for a valid run</h2>
              <p className="lede">Fix any field errors, then press Run simulation.</p>
            </section>
          )}
        </div>
      </main>

      <footer className="foot">
        <span>Demo for portfolio / Upwork · frontend-only simulation</span>
      </footer>
    </div>
  )
}
