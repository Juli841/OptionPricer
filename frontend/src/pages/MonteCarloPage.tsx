import McConvergenceChart from '../components/McConvergenceChart'
import McForm from '../components/McForm'
import McStats from '../components/McStats'
import { useMonteCarlo } from '../hooks/useMonteCarlo'

export default function MonteCarloPage() {
  const { form, setForm, result, error, submit } = useMonteCarlo()

  return (
    <>
      <McForm form={form} setForm={setForm} onSubmit={submit} />
      {error && <p role="alert" className="error">{error}</p>}
      {result && (
        <>
          <McStats res={result.res} reference={result.reference} />
          <McConvergenceChart res={result.res} reference={result.reference} />
        </>
      )}
    </>
  )
}
