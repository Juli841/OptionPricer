import OnePeriodForm from '../components/OnePeriodForm'
import Results from '../components/Results'
import Tree from '../components/Tree'
import { useOnePeriod } from '../hooks/useOnePeriod'

export default function OnePeriodPage() {
  const { form, setForm, result, error, submit } = useOnePeriod()

  return (
    <main style={{ maxWidth: 560, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Option Pricer — one-period binomial</h1>
      <OnePeriodForm form={form} setForm={setForm} onSubmit={submit} />
      {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}
      {result && (
        <section>
          <h2>Result</h2>
          <Results res={result.res} />
          <Tree s0={result.params.s0} res={result.res} />
        </section>
      )}
    </main>
  )
}
