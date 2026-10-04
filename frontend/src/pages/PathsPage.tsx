import PathsChart from '../components/PathsChart'
import SimulationForm from '../components/SimulationForm'
import SimulationStats from '../components/SimulationStats'
import UpsHistogram from '../components/UpsHistogram'
import { useSimulation } from '../hooks/useSimulation'

export default function PathsPage() {
  const { form, setForm, result, error, submit } = useSimulation()

  return (
    <>
      <SimulationForm form={form} setForm={setForm} onSubmit={submit} />
      {error && <p role="alert" className="error">{error}</p>}
      {result && (
        <>
          <SimulationStats params={result.params} res={result.res} />
          <PathsChart params={result.params} res={result.res} />
          <UpsHistogram params={result.params} res={result.res} />
        </>
      )}
    </>
  )
}
