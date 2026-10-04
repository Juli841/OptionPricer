import type { AmericanResult, PricingParams } from '../types/pricing'

type Props = {
  params: PricingParams
  stock: number[][]
  option: number[][]
  delta: number[][]
  american: AmericanResult | null // adds the exercise decision and the Shreve hedge columns
  level: number
  onLevel: (l: number) => void
}

const num = (x: number | undefined) => (x === undefined ? '–' : x.toFixed(4))

export default function LevelInspector({ params, stock, option, delta, american, level, onLevel }: Props) {
  const n = stock.length - 1
  const itm = (s: number) => (params.kind === 'call' ? s > params.k : s < params.k)
  // top row = most ups, like the tree
  const ups = Array.from({ length: level + 1 }, (_, i) => level - i)

  return (
    <div className="card">
      <h2>Level inspector</h2>
      <label className="slider">
        <span>Time step {level} of {n}</span>
        <input type="range" min={0} max={n} step={1} value={level} onChange={(e) => onLevel(+e.target.value)} />
      </label>
      {level === n && <p className="note">Expiry: nothing left to hedge or wait for, so delta, continuation, consumption and bond are empty.</p>}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Ups</th>
              <th>Stock S</th>
              <th>Value V</th>
              <th>In the money</th>
              <th>Delta Δ</th>
              {american && (
                <>
                  <th>Intrinsic</th>
                  <th>Continuation</th>
                  <th>Consumption C</th>
                  <th>Bond B</th>
                  <th>Decision</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {ups.map((j) => (
              <tr key={j}>
                <td>{j}</td>
                <td>{stock[level][j].toFixed(2)}</td>
                <td>{option[level][j].toFixed(4)}</td>
                <td>{!american && level < n ? '–' : itm(stock[level][j]) ? 'yes' : 'no'}</td>
                <td>{num(delta[level]?.[j])}</td>
                {american && (
                  <>
                    <td>{num(american.intrinsic?.[level][j])}</td>
                    <td>{num(american.continuation?.[level]?.[j])}</td>
                    <td>{num(american.consumption?.[level]?.[j])}</td>
                    <td>{num(american.bond?.[level]?.[j])}</td>
                    <td className={american.exercise?.[level][j] ? 'exercise' : ''}>
                      {american.exercise?.[level][j] ? 'Exercise' : 'Hold'}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="note">
        {american
          ? 'Hedge (Shreve): hold Δ shares and B in the bond after spending C; next step this is worth V in both states.'
          : 'Δ = (V_up − V_down) / (S_up − S_down): the shares that replicate the option over the next step.'}
      </p>
    </div>
  )
}
