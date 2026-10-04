import PricingForm from '../components/PricingForm'
import PricingView from '../components/PricingView'
import { priceAmerican } from '../api/pricing'
import { usePricing } from '../hooks/usePricing'

const INITIAL = { kind: 'put' as const } // early exercise matters for puts

export default function AmericanPage() {
  const { form, setForm, result, error, submit } = usePricing(priceAmerican, INITIAL)

  return (
    <>
      <PricingForm form={form} setForm={setForm} onSubmit={submit} />
      {error && <p role="alert" className="error">{error}</p>}
      {result && <PricingView params={result.params} res={result.res} />}
    </>
  )
}
