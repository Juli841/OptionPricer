import HedgeForm from '../components/HedgeForm'
import HedgeTable from '../components/HedgeTable'
import { useHedging } from '../hooks/useHedging'

export default function HedgingPage() {
  const h = useHedging()
  return (
    <>
      <HedgeForm
        form={h.form} setForm={h.setForm} onSubmit={h.submit}
        moves={h.moves} onLength={h.setLength} onFlip={h.flip} onRandom={h.randomise}
      />
      {h.error && <p role="alert" className="error">{h.error}</p>}
      {h.result && <HedgeTable params={h.result.params} res={h.result.res} />}
    </>
  )
}
