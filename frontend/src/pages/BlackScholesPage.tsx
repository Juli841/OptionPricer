import BsCurveChart from '../components/BsCurveChart'
import BsForm from '../components/BsForm'
import BsStats from '../components/BsStats'
import { useBlackScholes } from '../hooks/useBlackScholes'

export default function BlackScholesPage() {
  const { form, setForm, result, error, submit } = useBlackScholes()

  return (
    <>
      <BsForm form={form} setForm={setForm} onSubmit={submit} />
      {error && <p role="alert" className="error">{error}</p>}
      {result && (
        <>
          <BsStats page={result} />
          <BsCurveChart page={result} />
        </>
      )}
    </>
  )
}
