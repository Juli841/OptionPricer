import PricingForm from '../components/PricingForm'
import Results from '../components/Results'
import Tree from '../components/Tree'
import { usePricing } from '../hooks/usePricing'

export default function EuropeanPage() {
  const { form, setForm, result, error, submit } = usePricing()

  return (
    <>
      <PricingForm form={form} setForm={setForm} onSubmit={submit} />
      {error && <p role="alert" className="error">{error}</p>}
      {result && (
        <>
          <Results params={result.params} res={result.res} />
          {result.res.stock && result.res.option && result.res.delta && (
            <div className="card">
              <h2>Tree</h2>
              <p className="note">Top branch = up (probability q = {result.res.q.toFixed(3)}), bottom = down (1 − q = {(1 - result.res.q).toFixed(3)}). Node colour = option value vs the premium paid today (V₀): green above, red below. Hover a node for its delta.</p>
              <Tree stock={result.res.stock} option={result.res.option} delta={result.res.delta} />
            </div>
          )}
        </>
      )}
    </>
  )
}
