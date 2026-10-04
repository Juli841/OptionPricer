import { useState } from 'react'
import type { AmericanResult, PricingParams, PricingResult } from '../types/pricing'
import LevelInspector from './LevelInspector'
import Results from './Results'
import Tree from './Tree'

const isAmerican = (res: PricingResult | AmericanResult): res is AmericanResult => 'exercise' in res

// everything shown under the form: stats, tree, and the per-level table driven by the slider
export default function PricingView({ params, res }: { params: PricingParams; res: PricingResult | AmericanResult }) {
  const [level, setLevel] = useState(0)
  const { stock, option, delta } = res

  return (
    <>
      <Results params={params} res={res} />
      {stock && option && delta && (
        <>
          <div className="card">
            <h2>Tree</h2>
            <p className="note">
              Top branch = up (probability q = {res.q.toFixed(3)}), bottom = down (1 − q = {(1 - res.q).toFixed(3)}).
              Node colour = option value vs the premium paid today (V₀): green above, red below. A blue ring marks
              nodes in the money{isAmerican(res) ? '' : ' at expiry, where the option pays out (it cannot be exercised earlier)'}. The shaded column is the level picked in the inspector below; hover a node for its delta.
            </p>
            <Tree
              stock={stock}
              option={option}
              delta={delta}
              strike={params.k}
              kind={params.kind}
              level={Math.min(level, params.n)}
              ringEveryLevel={isAmerican(res)}
            />
          </div>
          <LevelInspector
            params={params}
            stock={stock}
            option={option}
            delta={delta}
            american={isAmerican(res) ? res : null}
            level={Math.min(level, params.n)}
            onLevel={setLevel}
          />
        </>
      )}
    </>
  )
}
