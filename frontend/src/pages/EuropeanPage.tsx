import PricingForm from '../components/PricingForm'
import PricingView from '../components/PricingView'
import { priceMultiPeriod } from '../api/pricing'
import { usePricing } from '../hooks/usePricing'

export default function EuropeanPage() {
  const { form, setForm, result, error, submit } = usePricing(priceMultiPeriod)

  return (
    <>
      <PricingForm form={form} setForm={setForm} onSubmit={submit} />
      {error && <p role="alert" className="error">{error}</p>}
      {result && <PricingView params={result.params} res={result.res} />}
    </>
  )
}
