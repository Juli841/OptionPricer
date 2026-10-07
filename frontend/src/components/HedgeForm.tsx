import { MAX_STEPS } from '../hooks/useHedging'
import type { HedgeFormValues } from '../types/hedging'
import type { OptionKind } from '../types/pricing'

type Props = {
  form: HedgeFormValues
  setForm: (f: HedgeFormValues) => void
  onSubmit: () => void
  moves: boolean[]
  onLength: (n: number) => void
  onFlip: (i: number) => void
  onRandom: () => void
}

export default function HedgeForm({ form, setForm, onSubmit, moves, onLength, onFlip, onRandom }: Props) {
  const num = (name: 's0' | 'k' | 'u' | 'd' | 'r', label: string) => (
    <label>
      <span>{label}</span>
      <input
        type="number" step="any" required
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      />
    </label>
  )

  return (
    <form className="card" onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
      <div className="form">
        {num('s0', 'Stock price S₀')}
        {num('k', 'Strike K')}
        {num('u', 'Up factor u')}
        {num('d', 'Down factor d')}
        {num('r', 'Rate r (per step)')}
        <label>
          <span>Option</span>
          <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as OptionKind })}>
            <option value="call">Call</option>
            <option value="put">Put</option>
          </select>
        </label>
        <label>
          <span>Steps n</span>
          <input
            type="number" step={1} min={1} max={MAX_STEPS}
            value={moves.length}
            onChange={(e) => !Number.isNaN(e.target.valueAsNumber) && onLength(e.target.valueAsNumber)}
          />
        </label>
        <button type="submit" className="primary">Replicate</button>
      </div>
      <div className="path-builder">
        <span className="stat-label">Path: click a step to flip it</span>
        <div className="chips">
          {moves.map((up, i) => (
            <button
              key={i} type="button"
              className={up ? 'chip up' : 'chip down'}
              onClick={() => onFlip(i)}
              aria-label={`Step ${i + 1}: ${up ? 'up' : 'down'}, click to flip`}
            >
              {up ? '▲' : '▼'}
            </button>
          ))}
          <button type="button" className="ghost" onClick={onRandom}>Random path</button>
        </div>
      </div>
    </form>
  )
}
